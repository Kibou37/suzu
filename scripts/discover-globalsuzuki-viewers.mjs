/**
 * Phase 1 — Discover 360° viewers from globalsuzuki.com automobile lineup.
 *
 * For each model page with `.viewerArea`, loads grade_list + default grade JSON
 * and writes frontend/src/data/globalsuzuki-viewer-catalog.json.
 *
 * Usage: pnpm assets:viewer-discover
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AUTOMOBILE_INDEX,
  MODELS_WITHOUT_VIEWER,
  buildBodyMaterialMap,
  buildInteriorMaterialMap,
  fetchJson,
  fetchText,
  gradeFolderFromGradeId,
  gradeListUrl,
  parseBodyColorsFromItems,
  parseInteriorVariantsFromItems,
  parseLineupSlugs,
  parseViewerFromLineupPage,
  pickDefaultGrade,
  settingBaseUrl,
  sleep,
} from './globalsuzuki-viewer-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outPath = path.join(root, 'frontend', 'src', 'data', 'globalsuzuki-viewer-catalog.json');

async function discoverModel(lineupSlug) {
  const lineupUrl = `https://www.globalsuzuki.com/automobile/lineup/${lineupSlug}/`;
  const result = {
    lineupSlug,
    lineupUrl,
    hasViewerArea: false,
    hasGradeList: false,
    viewerSlug: lineupSlug,
    viewerUrl: null,
    defaultGradeId: null,
    gradeFolder: null,
    angleStep: 36,
    bodyColors: [],
    interiorVariants: [],
    errors: [],
  };

  if (MODELS_WITHOUT_VIEWER.has(lineupSlug)) {
    result.errors.push('Known model without 360° viewer');
    return result;
  }

  try {
    const html = await fetchText(lineupUrl);
    const viewerInfo = parseViewerFromLineupPage(html, lineupSlug);
    result.hasViewerArea = viewerInfo.hasViewerArea;
    result.viewerSlug = viewerInfo.viewerSlug;
    result.viewerUrl = viewerInfo.viewerUrl;

    const gradeList = await fetchJson(gradeListUrl(viewerInfo.viewerSlug));
    result.hasGradeList = true;
    result.angleStep = gradeList.GRADE?.angleStep ?? 36;

    const defaultGradeId = pickDefaultGrade(gradeList);
    const gradeFolder = gradeFolderFromGradeId(defaultGradeId);
    if (!gradeFolder) {
      result.errors.push(`Could not resolve grade folder for ${defaultGradeId}`);
      return result;
    }

    result.defaultGradeId = defaultGradeId;
    result.gradeFolder = gradeFolder;

    const base = settingBaseUrl(viewerInfo.viewerSlug, gradeFolder);
    const [itemsJson, materialsJson] = await Promise.all([
      fetchJson(`${base}/${gradeFolder}_items.json`),
      fetchJson(`${base}/${gradeFolder}_materials.json`),
    ]);

    const bodyMaterialMap = buildBodyMaterialMap(materialsJson);
    const interiorMaterialMap = buildInteriorMaterialMap(materialsJson);

    result.bodyColors = parseBodyColorsFromItems(itemsJson).map((color, index) => ({
      colorSetId: `color_${index}`,
      ...color,
      materialKey: bodyMaterialMap.get(color.bcCode),
    }));

    result.interiorVariants = parseInteriorVariantsFromItems(itemsJson).map((variant, index) => ({
      variantId: `int_${index}`,
      ...variant,
      materialKey: interiorMaterialMap.get(variant.intCode),
    }));
  } catch (error) {
    result.errors.push(error instanceof Error ? error.message : String(error));
  }

  return result;
}

async function main() {
  console.log('Fetching automobile index…');
  const indexHtml = await fetchText(AUTOMOBILE_INDEX);
  const lineupSlugs = parseLineupSlugs(indexHtml);
  console.log(`Found ${lineupSlugs.length} lineup models`);

  const models = {};
  for (const slug of lineupSlugs) {
    process.stdout.write(`  ${slug}… `);
    models[slug] = await discoverModel(slug);
    const entry = models[slug];
    const status = entry.hasGradeList
      ? `${entry.bodyColors.length} colours, ${entry.interiorVariants.length} interiors`
      : entry.errors[0] ?? 'no viewer';
    console.log(status);
    await sleep(150);
  }

  const withViewer = Object.values(models).filter((m) => m.hasGradeList);
  const catalog = {
    generatedAt: new Date().toISOString(),
    source: 'https://www.globalsuzuki.com/automobile/',
    summary: {
      totalModels: lineupSlugs.length,
      withViewerArea: Object.values(models).filter((m) => m.hasViewerArea).length,
      withGradeList: withViewer.length,
      totalBodyColors: withViewer.reduce((sum, m) => sum + m.bodyColors.length, 0),
      totalInteriorVariants: withViewer.reduce((sum, m) => sum + m.interiorVariants.length, 0),
    },
    models,
  };

  fs.writeFileSync(outPath, `${JSON.stringify(catalog, null, 2)}\n`);
  console.log(`\nWrote ${outPath}`);
  console.log(
    `Summary: ${catalog.summary.withGradeList}/${catalog.summary.totalModels} models with 360° metadata`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
