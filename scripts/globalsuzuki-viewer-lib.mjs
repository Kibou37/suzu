/**
 * Shared helpers for Global Suzuki 360° viewer scraping.
 * @see https://www.globalsuzuki.com/automobile/
 */
import fs from 'node:fs';
import path from 'node:path';

export const GLOBALSUZUKI_ORIGIN = 'https://www.globalsuzuki.com';
export const AUTOMOBILE_INDEX = `${GLOBALSUZUKI_ORIGIN}/automobile/`;

export const FRAME_COUNT = 36;
export const INTERIOR_FACE_COUNT = 6;
export const FRAME_PAD = 2;

/** Models without a 360° viewer (no grade_list.json). */
export const MODELS_WITHOUT_VIEWER = new Set(['alto', 'apv', 'carry']);

/** suzuki-motor.ru pages with Perxis img360 / interior panorama widgets. */
export const SUZUKI_MOTOR_360_PAGES = {
  vitara: 'https://suzuki-motor.ru/auto/new-vitara/',
  jimny: 'https://suzuki-motor.ru/auto/jimny/',
};

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function readJsonFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

export async function fetchText(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SuzukiViewerSync/1.0)',
      ...options.headers,
    },
    signal: AbortSignal.timeout(options.timeoutMs ?? 60_000),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} for ${url}`);
  }
  return response.text();
}

export async function fetchJson(url, options = {}) {
  const text = await fetchText(url, options);
  return JSON.parse(text.replace(/^\uFEFF/, ''));
}

export async function downloadToFile(url, destPath, options = {}) {
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; SuzukiViewerSync/1.0)',
      Referer: `${GLOBALSUZUKI_ORIGIN}/automobile/`,
      ...options.headers,
    },
    signal: AbortSignal.timeout(options.timeoutMs ?? 120_000),
  });

  if (!response.ok) {
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    return false;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length < (options.minBytes ?? 512)) {
    if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
    return false;
  }

  fs.writeFileSync(destPath, buffer);
  return true;
}

/** Parse lineup slugs from the automobile index page. */
export function parseLineupSlugs(html) {
  const slugs = new Set();
  const pattern = /\/automobile\/lineup\/([a-z0-9-]+)\//gi;
  for (const match of html.matchAll(pattern)) {
    slugs.add(match[1].toLowerCase());
  }
  return [...slugs].sort();
}

/** Detect viewerArea block and iframe viewer path on a model lineup page. */
export function parseViewerFromLineupPage(html, lineupSlug) {
  const hasViewerArea = /class="[^"]*viewerArea[^"]*"/i.test(html);
  const viewerPathMatch =
    html.match(/\/automobile\/lineup\/([a-z0-9-]+)\/viewer\/large\/main\.html/i) ??
    html.match(new RegExp(`/automobile/lineup/${lineupSlug}/viewer`, 'i'));

  const viewerSlug = viewerPathMatch?.[1] ?? lineupSlug;
  const viewerUrl = `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/large/main.html`;

  return {
    hasViewerArea,
    viewerSlug,
    viewerUrl,
    gradeListUrl: `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/assets/setting/grade_list.json`,
  };
}

export function gradeListUrl(viewerSlug) {
  return `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/assets/setting/grade_list.json`;
}

export function pickDefaultGrade(gradeList) {
  const items = gradeList?.GRADE?.groups?.[0]?.items ?? [];
  const visible = items.filter((item) => item.visible !== false);
  return (
    visible.find((item) => item.checked)?.item_id ??
    visible[0]?.item_id ??
    items[0]?.item_id
  );
}

export function gradeFolderFromGradeId(gradeId) {
  if (!gradeId) return null;
  const match = gradeId.match(/^GRD_(.+)$/);
  return match?.[1] ?? null;
}

export function settingBaseUrl(viewerSlug, gradeFolder) {
  return `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/assets/setting/${gradeFolder}`;
}

export function collectGroupItems(category) {
  if (!category?.groups) return [];
  return category.groups.flatMap((group) => group.items ?? []);
}

export function parseBodyColorsFromItems(itemsJson) {
  const bodyCategory = itemsJson.ITEMS?.find((cat) => cat.category_id === 'BODYCOLOR');
  return collectGroupItems(bodyCategory)
    .filter((item) => item.visible !== false && item.item_id?.startsWith('BC_'))
    .map((item) => ({
      bcCode: item.item_id,
      name: item.label?.trim() ?? item.item_id,
      thumbnail: item.thumbnail ?? item.item_id,
    }));
}

export function parseInteriorVariantsFromItems(itemsJson) {
  const interiorCategory = itemsJson.ITEMS?.find((cat) => cat.category_id === 'INT_BASE');
  return collectGroupItems(interiorCategory)
    .filter((item) => item.visible !== false && item.item_id)
    .map((item) => ({
      intCode: item.item_id,
      name: item.label?.trim() ?? item.item_id,
    }));
}

export function buildBodyMaterialMap(materialsJson) {
  const map = new Map();
  for (const entry of materialsJson.MATERIALS?.EXT ?? []) {
    if (entry.layer !== 0) continue;
    const bcCode = entry.items?.find((item) => item.startsWith('BC_'));
    if (bcCode && entry.material) {
      map.set(bcCode, entry.material);
    }
  }
  return map;
}

export function buildInteriorMaterialMap(materialsJson) {
  const map = new Map();
  for (const entry of materialsJson.MATERIALS?.INT ?? []) {
    if (entry.layer !== 0) continue;
    const intCode = entry.items?.find((item) => item.startsWith('INT'));
    if (intCode && entry.material) {
      map.set(intCode, entry.material);
    }
  }
  return map;
}

/** Candidate CDN paths used by the legacy Flash/HTML viewer. */
export function exteriorFrameUrlCandidates(viewerSlug, materialKey, frameIndex) {
  const suffix = String(frameIndex).padStart(2, '0');
  const fileName = `${materialKey}_${suffix}.jpg`;
  const bases = [
    `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/assets/materials`,
    `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/materials`,
  ];
  return bases.map((base) => `${base}/${materialKey}/${fileName}`);
}

export function interiorFaceUrlCandidates(viewerSlug, materialKey, faceIndex) {
  const suffix = String(faceIndex).padStart(2, '0');
  const fileName = `${materialKey}_${suffix}.jpg`;
  const bases = [
    `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/assets/materials`,
    `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/materials`,
  ];
  return bases.map((base) => `${base}/${materialKey}/${fileName}`);
}

export function swatchUrl(viewerSlug, thumbnail) {
  return `${GLOBALSUZUKI_ORIGIN}/automobile/lineup/${viewerSlug}/viewer/assets/materials/thumbnails/${thumbnail}.png`;
}

export function extFromUrl(url) {
  const match = url.match(/\.(jpe?g|png|webp)(?:\?|$)/i);
  return match ? `.${match[1].toLowerCase().replace('jpeg', 'jpg')}` : '.jpg';
}

/** Parse Perxis img360 colour sets from suzuki-motor.ru HTML. */
export function parsePerxisExterior360(html) {
  const sets = [];
  const blockPattern =
    /<div[^>]*id="(color_\d+)"[^>]*class="[^"]*img360[^"]*"[^>]*data-images="([^"]+)"/gi;

  for (const match of html.matchAll(blockPattern)) {
    const frames = match[2]
      .split(',')
      .map((url) => url.trim())
      .filter(Boolean);
    if (frames.length) {
      sets.push({ id: match[1], frames });
    }
  }

  return sets;
}

/** Parse interior panorama URL from suzuki-motor.ru widget bootstrap. */
export function parsePerxisInteriorPanorama(html) {
  const match = html.match(/panoramaUrl:\s*['"]([^'"]+)['"]/i);
  return match?.[1];
}
