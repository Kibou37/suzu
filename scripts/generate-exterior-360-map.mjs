/**
 * Generates exterior-360 BC_* → color_* maps from globalsuzuki-viewer-catalog.json
 * for configurator models. Run after discover.
 *
 * Usage: node scripts/generate-exterior-360-map.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJsonFile } from './globalsuzuki-viewer-lib.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const catalogPath = path.join(root, 'frontend', 'src', 'data', 'globalsuzuki-viewer-catalog.json');
const mapPath = path.join(root, 'frontend', 'src', 'data', 'exterior-360-color-map.generated.json');

const CONFIGURATOR_MODELS = ['vitara', 'jimny', 'swift', 's-cross'];

function main() {
  if (!fs.existsSync(catalogPath)) {
    console.error(`Missing ${catalogPath}. Run: pnpm assets:viewer-discover`);
    process.exit(1);
  }

  const catalog = readJsonFile(catalogPath);
  const map = {};

  for (const modelSlug of CONFIGURATOR_MODELS) {
    const entry = catalog.models?.[modelSlug];
    if (!entry?.bodyColors?.length) continue;

    map[modelSlug] = {};
    for (const color of entry.bodyColors) {
      if (color.bcCode && color.colorSetId) {
        map[modelSlug][color.bcCode] = color.colorSetId;
      }
    }
  }

  fs.writeFileSync(mapPath, `${JSON.stringify(map, null, 2)}\n`);
  console.log(`Wrote ${mapPath}`);
  for (const [model, colors] of Object.entries(map)) {
    console.log(`  ${model}: ${Object.keys(colors).length} colour mappings`);
  }
}

main();
