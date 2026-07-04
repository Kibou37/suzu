/**
 * Extracts body/interior colours and exterior options from Global Suzuki 360° viewer JSON.
 * Source: https://www.globalsuzuki.com/automobile/lineup/{model}/viewer/assets/setting/
 */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const tmpDir = path.join(root, '.tmp-suzuki');
const swatchDir = path.join(root, 'frontend', 'public', 'configurator', 'swatches');
const outFile = path.join(root, 'frontend', 'src', 'data', 'suzuki-viewer-catalog.ts');

const MODELS = [
  { slug: 'vitara', viewerSlug: 'vitara', itemsFile: 'vitara-items.json', gradeFolder: 'GLX' },
  { slug: 'jimny', viewerSlug: 'jimny', itemsFile: 'jimny-items.json', gradeFolder: 'GLX' },
  { slug: 'swift', viewerSlug: 'swift', itemsFile: 'swift-items.json', gradeFolder: 'GL' },
  { slug: 's-cross', viewerSlug: 's-cross', itemsFile: 'scross-items.json', gradeFolder: 'GLX' },
];

function slugifyId(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function collectGroupItems(category) {
  if (!category?.groups) return [];
  return category.groups.flatMap((group) => group.items ?? []);
}

function parseItems(raw) {
  const categories = raw.ITEMS ?? [];

  const bodyCategory = categories.find((c) => c.category_id === 'BODYCOLOR');
  const interiorCategory = categories.find((c) => c.category_id === 'INT_BASE');
  const optionsCategory = categories.find((c) => c.category_id === 'EXT_OPTION');

  const bodyColors = collectGroupItems(bodyCategory)
    .filter((item) => item.visible !== false && item.label && item.item_id?.startsWith('BC_'))
    .map((item) => ({
      id: slugifyId(item.item_id),
      suzukiId: item.item_id,
      name: item.label.trim(),
      thumbnail: item.thumbnail,
      price: 0,
    }));

  const interiorColors = collectGroupItems(interiorCategory)
    .filter((item) => item.visible !== false && item.label)
    .map((item) => ({
      id: slugifyId(item.item_id),
      suzukiId: item.item_id,
      name: item.label.trim(),
      thumbnail: item.thumbnail,
      price: 0,
    }));

  const options = collectGroupItems(optionsCategory)
    .filter((item) => item.visible !== false && item.label && item.isConfig !== false)
    .map((item) => ({
      id: slugifyId(item.item_id),
      suzukiId: item.item_id,
      name: item.label.trim(),
      description: item.description?.trim() || undefined,
      thumbnail: item.thumbnail,
      price: 0,
      category: 'Exterior',
    }));

  return { bodyColors, interiorColors, options };
}

function buildBodyMaterialMap(materialsRaw) {
  const map = new Map();
  for (const entry of materialsRaw.MATERIALS?.EXT ?? []) {
    if (entry.layer !== 0) continue;
    const bodyColorId = entry.items?.find((item) => item.startsWith('BC_'));
    if (bodyColorId && entry.material) {
      map.set(bodyColorId, entry.material);
    }
  }
  return map;
}

function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function loadMaterialsJson(model) {
  const localPath = path.join(tmpDir, `${model.slug}-materials.json`);
  if (fs.existsSync(localPath)) {
    return readJsonFile(localPath);
  }

  const url = `https://www.globalsuzuki.com/automobile/lineup/${model.viewerSlug}/viewer/assets/setting/${model.gradeFolder}/${model.gradeFolder}_materials.json`;
  try {
    execSync(`curl.exe -sL -m 90 "${url}" -o "${localPath}"`, { stdio: 'pipe' });
    if (fs.existsSync(localPath) && fs.statSync(localPath).size > 32) {
      return readJsonFile(localPath);
    }
  } catch {
    /* ignore */
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function downloadSwatch(viewerSlug, thumbnail, destPath) {
  const base = `https://www.globalsuzuki.com/automobile/lineup/${viewerSlug}/viewer/assets/materials/thumbnails`;
  const candidates = [`${thumbnail}.png`, `Sub-${thumbnail}.png`];
  fs.mkdirSync(path.dirname(destPath), { recursive: true });

  for (const file of candidates) {
    const url = `${base}/${file}`;
    try {
      execSync(`curl.exe -sL -m 90 "${url}" -o "${destPath}"`, { stdio: 'pipe' });
      if (fs.existsSync(destPath) && fs.statSync(destPath).size > 64) {
        return true;
      }
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    } catch {
      if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    }
  }

  console.warn(`  skip swatch ${thumbnail}`);
  return false;
}

const catalog = {};

for (const model of MODELS) {
  const itemsPath = path.join(tmpDir, model.itemsFile);
  if (!fs.existsSync(itemsPath)) {
    console.error(`Missing ${itemsPath}`);
    process.exit(1);
  }

  const parsed = parseItems(JSON.parse(fs.readFileSync(itemsPath, 'utf8')));
  const materialsRaw = loadMaterialsJson(model);
  const materialMap = materialsRaw ? buildBodyMaterialMap(materialsRaw) : new Map();

  for (const color of parsed.bodyColors) {
    color.materialKey = materialMap.get(color.suzukiId);
  }

  const modelSwatchDir = path.join(swatchDir, model.slug);

  console.log(`\n${model.slug}: ${parsed.bodyColors.length} body, ${parsed.interiorColors.length} interior, ${parsed.options.length} options`);

  for (const color of [...parsed.bodyColors, ...parsed.interiorColors]) {
    const dest = path.join(modelSwatchDir, `${color.thumbnail}.png`);
    const publicPath = `/configurator/swatches/${model.slug}/${color.thumbnail}.png`;
    const ok = downloadSwatch(model.viewerSlug, color.thumbnail, dest);
    color.swatch = ok ? publicPath : undefined;
    await sleep(200);
  }

  catalog[model.slug] = {
    bodyColors: parsed.bodyColors.map(({ suzukiId, ...rest }) => rest),
    interiorColors: parsed.interiorColors.map(({ suzukiId, ...rest }) => rest),
    options: parsed.options.map(({ suzukiId, thumbnail, ...rest }) => rest),
  };
}

const fileContent = `/**
 * Colours and options sourced from Global Suzuki 360° viewer JSON.
 * @see https://www.globalsuzuki.com/automobile/
 * Generated by scripts/extract-suzuki-viewer-colors.mjs — do not edit manually.
 */
import type { ConfiguratorData } from './demo-configurator';

export type SuzukiViewerColor = {
  id: string;
  name: string;
  thumbnail: string;
  swatch?: string;
  price: number;
};

export type SuzukiViewerOption = {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: string;
};

export const suzukiViewerCatalog: Record<string, ConfiguratorData> = ${JSON.stringify(catalog, null, 2)} as const;

export function getSuzukiViewerData(modelSlug: string): ConfiguratorData | undefined {
  return suzukiViewerCatalog[modelSlug];
}
`;

fs.writeFileSync(outFile, fileContent);
console.log(`\nWrote ${outFile}`);
