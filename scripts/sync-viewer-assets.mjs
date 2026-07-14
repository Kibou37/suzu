/**
 * Phase 2–3 — Download 360° assets into frontend/public and update manifests.
 *
 * Sources (in order):
 *  1. car-model-content.raw.json (Perxis URLs — Vitara/Jimny)
 *  2. suzuki-motor.ru Perxis widgets (Vitara/Jimny refresh)
 *  3. globalsuzuki-viewer-catalog.json (all models with viewerArea)
 *
 * Usage: pnpm assets:viewer-sync
 * Full pipeline: pnpm assets:viewer-sync:all
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  FRAME_COUNT,
  FRAME_PAD,
  INTERIOR_FACE_COUNT,
  SUZUKI_MOTOR_360_PAGES,
  downloadToFile,
  extFromUrl,
  exteriorFrameUrlCandidates,
  fetchText,
  interiorFaceUrlCandidates,
  parsePerxisExterior360,
  parsePerxisInteriorPanorama,
  readJsonFile,
  sleep,
  swatchUrl,
} from './globalsuzuki-viewer-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const rawPath = path.join(root, 'frontend', 'src', 'data', 'car-model-content.raw.json');
const catalogPath = path.join(root, 'frontend', 'src', 'data', 'globalsuzuki-viewer-catalog.json');
const perxisRawPath = path.join(root, 'frontend', 'src', 'data', 'suzuki-motor-360.raw.json');
const publicRoot = path.join(root, 'frontend', 'public');
const manifestPath = path.join(root, 'frontend', 'src', 'data', 'car-viewer-assets.json');

/** Configurator slugs synced from globalsuzuki CDN in Phase C (pass --all for every model). */
const CONFIGURATOR_LINEUP_ALIASES = {
  vitara: 'vitara',
  jimny: 'jimny',
  swift: 'swift',
  's-cross': 's-cross',
};

const syncAllModels = process.argv.includes('--all');

async function downloadFirstWorking(urls, destPath) {
  for (const url of urls) {
    const ok = await downloadToFile(url, destPath);
    if (ok) return url;
  }
  return null;
}

async function syncPerxisColorSet(modelSlug, colorSet, manifest) {
  if (!manifest.exterior360[modelSlug]) manifest.exterior360[modelSlug] = {};

  const frames = [];
  const destDir = path.join(publicRoot, 'configurator', '360', modelSlug, colorSet.id);

  for (let i = 0; i < colorSet.frames.length; i++) {
    const url = colorSet.frames[i];
    if (!url.includes('img.perxis.ru') && !url.includes('platform.suzuki-motor.ru')) {
      return;
    }

    const ext = extFromUrl(url);
    const fileName = `frame-${String(i + 1).padStart(FRAME_PAD, '0')}${ext}`;
    const destPath = path.join(destDir, fileName);
    const publicPath = `/configurator/360/${modelSlug}/${colorSet.id}/${fileName}`;

    if (fs.existsSync(destPath) && fs.statSync(destPath).size > 512) {
      frames.push(publicPath);
      continue;
    }

    const ok = await downloadToFile(url, destPath);
    if (!ok) {
      // Expected sometimes (network / CDN). Keep stderr quiet to avoid CI/shell treating it as a hard error.
      console.log(`    skip perxis set ${modelSlug}/${colorSet.id} at frame ${i + 1}`);
      return;
    }

    frames.push(publicPath);
    await sleep(60);
  }

  if (frames.length) {
    manifest.exterior360[modelSlug][colorSet.id] = frames;
    console.log(`    ${modelSlug}/${colorSet.id}: ${frames.length} perxis frames`);
  }
}

async function syncPerxisInterior(modelSlug, panorama, manifest) {
  const ext = extFromUrl(panorama.imageUrl);
  const destPath = path.join(publicRoot, 'panoramas', `${modelSlug}${ext}`);
  const publicPath = `/panoramas/${modelSlug}${ext}`;

  if (!fs.existsSync(destPath) || fs.statSync(destPath).size < 512) {
    const ok = await downloadToFile(panorama.imageUrl, destPath);
    if (!ok) {
      console.log(`    skip interior panorama ${modelSlug}`);
      return;
    }
  }

  manifest.interiorPanorama[modelSlug] = {
    imageUrl: publicPath,
    title: panorama.title,
  };
  console.log(`    interior ${modelSlug} -> ${publicPath}`);
}

async function scrapeSuzukiMotor360() {
  const scraped = {};
  const { execSync } = await import('node:child_process');

  for (const [modelSlug, pageUrl] of Object.entries(SUZUKI_MOTOR_360_PAGES)) {
    console.log(`\n  suzuki-motor.ru ${modelSlug}`);
    try {
      let html;
      try {
        html = await fetchText(pageUrl, { timeoutMs: 45_000 });
      } catch {
        const tmpFile = path.join(root, 'tmp', `suzuki-motor-${modelSlug}.html`);
        fs.mkdirSync(path.dirname(tmpFile), { recursive: true });
        execSync(`curl.exe -sL -m 60 -A "Mozilla/5.0" "${pageUrl}" -o "${tmpFile}"`, {
          stdio: 'pipe',
        });
        html = fs.readFileSync(tmpFile, 'utf8');
      }

      const exterior360 = parsePerxisExterior360(html);
      const panoramaUrl = parsePerxisInteriorPanorama(html);

      scraped[modelSlug] = {
        sourceUrl: pageUrl,
        exterior360,
        interiorPanorama: panoramaUrl
          ? { imageUrl: panoramaUrl, title: `${modelSlug} interior` }
          : undefined,
      };

      console.log(
        `    ${exterior360.length} exterior sets${panoramaUrl ? ', interior panorama' : ''}`,
      );
    } catch (error) {
      console.log(`    failed: ${error instanceof Error ? error.message : error}`);
      scraped[modelSlug] = { sourceUrl: pageUrl, errors: [String(error)] };
    }
  }

  fs.writeFileSync(perxisRawPath, `${JSON.stringify(scraped, null, 2)}\n`);
  console.log(`\n  Wrote ${perxisRawPath}`);
  return scraped;
}

async function syncGlobalsuzukiModel(modelEntry, manifest, stats) {
  const { lineupSlug, viewerSlug, bodyColors, interiorVariants } = modelEntry;
  if (!bodyColors?.length) return;

  if (!manifest.exterior360[lineupSlug]) manifest.exterior360[lineupSlug] = {};
  if (!manifest.interiorCubemap) manifest.interiorCubemap = {};
  if (!manifest.interiorCubemap[lineupSlug]) manifest.interiorCubemap[lineupSlug] = {};

  console.log(`\n  globalsuzuki ${lineupSlug} (${bodyColors.length} colours)`);

  for (const color of bodyColors) {
    if (!color.materialKey) continue;

    const frames = [];
    const destDir = path.join(publicRoot, 'configurator', '360', lineupSlug, color.colorSetId);

    for (let frameIndex = 1; frameIndex <= FRAME_COUNT; frameIndex++) {
      const fileName = `frame-${String(frameIndex).padStart(FRAME_PAD, '0')}.jpg`;
      const destPath = path.join(destDir, fileName);
      const publicPath = `/configurator/360/${lineupSlug}/${color.colorSetId}/${fileName}`;

      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 512) {
        frames.push(publicPath);
        continue;
      }

      const urls = exteriorFrameUrlCandidates(viewerSlug, color.materialKey, frameIndex);
      const source = await downloadFirstWorking(urls, destPath);
      if (!source) {
        stats.exteriorFailed++;
        break;
      }

      frames.push(publicPath);
      stats.exteriorDownloaded++;
      await sleep(40);
    }

    if (frames.length === FRAME_COUNT) {
      manifest.exterior360[lineupSlug][color.colorSetId] = frames;
      console.log(`    ${color.colorSetId} (${color.bcCode}): ${frames.length} frames`);
    } else if (frames.length > 0) {
      console.log(`    ${color.colorSetId}: partial ${frames.length}/${FRAME_COUNT} — CDN offline?`);
    }

    const swatchDest = path.join(
      publicRoot,
      'configurator',
      'swatches',
      lineupSlug,
      `${color.bcCode}.png`,
    );
    if (!fs.existsSync(swatchDest) || fs.statSync(swatchDest).size < 64) {
      await downloadToFile(swatchUrl(viewerSlug, color.thumbnail ?? color.bcCode), swatchDest, {
        minBytes: 64,
      });
    }
  }

  for (const variant of interiorVariants ?? []) {
    if (!variant.materialKey) continue;

    const faces = [];
    const destDir = path.join(
      publicRoot,
      'configurator',
      'interior',
      lineupSlug,
      variant.variantId,
    );

    for (let faceIndex = 1; faceIndex <= INTERIOR_FACE_COUNT; faceIndex++) {
      const fileName = `face-${String(faceIndex).padStart(2, '0')}.jpg`;
      const destPath = path.join(destDir, fileName);
      const publicPath = `/configurator/interior/${lineupSlug}/${variant.variantId}/${fileName}`;

      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 512) {
        faces.push(publicPath);
        continue;
      }

      const urls = interiorFaceUrlCandidates(viewerSlug, variant.materialKey, faceIndex);
      const source = await downloadFirstWorking(urls, destPath);
      if (!source) break;

      faces.push(publicPath);
      await sleep(40);
    }

    if (faces.length === INTERIOR_FACE_COUNT) {
      manifest.interiorCubemap[lineupSlug][variant.variantId] = {
        faces,
        title: variant.name,
        intCode: variant.intCode,
      };
      console.log(`    ${variant.variantId} (${variant.intCode}): ${faces.length} cubemap faces`);
    }
  }
}

async function main() {
  const previousManifest = fs.existsSync(manifestPath)
    ? readJsonFile(manifestPath)
    : {};

  const manifest = {
    generatedAt: new Date().toISOString(),
    exterior360: {},
    exterior360Stub: previousManifest.exterior360Stub ?? {},
    interiorPanorama: {},
    interiorCubemap: {},
    sources: [],
  };

  const stats = { exteriorDownloaded: 0, exteriorFailed: 0 };

  // --- Phase A: legacy Perxis raw JSON (Vitara/Jimny) ---
  if (fs.existsSync(rawPath)) {
    console.log('\n=== Phase A: car-model-content.raw.json (Perxis) ===');
    manifest.sources.push('car-model-content.raw.json');
    const raw = readJsonFile(rawPath);

    for (const [modelSlug, model] of Object.entries(raw)) {
      for (const colorSet of model.exterior360 ?? []) {
        await syncPerxisColorSet(modelSlug, colorSet, manifest);
      }
      if (model.interiorPanorama?.imageUrl) {
        await syncPerxisInterior(modelSlug, model.interiorPanorama, manifest);
      }
    }
  }

  // --- Phase B: suzuki-motor.ru Perxis widgets ---
  console.log('\n=== Phase B: suzuki-motor.ru Perxis scrape ===');
  manifest.sources.push('suzuki-motor.ru');
  const scraped = await scrapeSuzukiMotor360();

  for (const [modelSlug, data] of Object.entries(scraped)) {
    for (const colorSet of data.exterior360 ?? []) {
      await syncPerxisColorSet(modelSlug, colorSet, manifest);
    }
    if (data.interiorPanorama?.imageUrl) {
      await syncPerxisInterior(modelSlug, data.interiorPanorama, manifest);
    }
  }

  // --- Phase C: globalsuzuki viewerArea catalog ---
  if (!fs.existsSync(catalogPath)) {
    console.warn(
      `\nCatalog missing: ${catalogPath}\nRun: pnpm assets:viewer-discover`,
    );
  } else {
    console.log('\n=== Phase C: globalsuzuki.com viewerArea assets ===');
    manifest.sources.push('globalsuzuki-viewer-catalog.json');
    const catalog = readJsonFile(catalogPath);

    const configuratorSlugs = new Set(Object.keys(CONFIGURATOR_LINEUP_ALIASES));
    const modelsToSync = Object.entries(catalog.models ?? {}).filter(([slug, entry]) => {
      if (!entry.hasGradeList) return false;
      if (syncAllModels) return entry.hasViewerArea || configuratorSlugs.has(slug);
      return configuratorSlugs.has(slug);
    });

    console.log(
      `Syncing ${modelsToSync.length} model(s)${syncAllModels ? ' (--all)' : ' (configurator only)'}…`,
    );

    for (const [, modelEntry] of modelsToSync) {
      await syncGlobalsuzukiModel(modelEntry, manifest, stats);
      await sleep(200);
    }
  }

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const frameTotal = Object.values(manifest.exterior360).reduce(
    (sum, model) => sum + Object.values(model).reduce((s, frames) => s + frames.length, 0),
    0,
  );

  console.log('\n=== Done ===');
  console.log(`Wrote ${manifestPath}`);
  console.log(`Exterior frames in manifest: ${frameTotal}`);
  console.log(
    `Globalsuzuki CDN: ${stats.exteriorDownloaded} downloaded, ${stats.exteriorFailed} failed requests`,
  );
  if (stats.exteriorDownloaded === 0 && stats.exteriorFailed > 0) {
    console.log(
      '\nNote: globalsuzuki.com raster frames currently return HTTP 404.\n' +
        'Metadata and Perxis assets are still saved. Re-run when CDN is restored.',
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
