import rawContent from '@/data/car-model-content.raw.json';
import {
  EXTERIOR_360_THUMBNAIL_MAP,
  has360Support,
} from '@/data/exterior-360-color-map';
import type { ConfigColor } from '@/data/demo-configurator';

export type Exterior360ColorSet = {
  id: string;
  name: string;
  hexes: string[];
  frames: string[];
};

type RawModelContent = {
  slug: string;
  exterior360?: Exterior360ColorSet[];
};

const exterior360ByModel = rawContent as Record<string, RawModelContent>;

export const SUZUKI_VIEWER_LINEUP: Record<string, string> = {
  vitara: 'vitara',
  jimny: 'jimny',
  swift: 'swift',
  's-cross': 's-cross',
};

export function getSuzukiViewerIframeUrl(modelSlug: string): string | undefined {
  const lineup = SUZUKI_VIEWER_LINEUP[modelSlug];
  if (!lineup) return undefined;
  return `https://www.globalsuzuki.com/automobile/lineup/${lineup}/viewer/large/main.html`;
}

export function getExterior360Colors(modelSlug: string): Exterior360ColorSet[] {
  return exterior360ByModel[modelSlug]?.exterior360 ?? [];
}

/** Map selected body colour to a 360° frame sequence via explicit BC_* thumbnail id. */
export function resolveExterior360Frames(
  modelSlug: string,
  bodyColor?: ConfigColor,
): string[] | undefined {
  if (!bodyColor?.thumbnail) return undefined;

  const sets = getExterior360Colors(modelSlug);
  if (sets.length === 0) return undefined;

  const mappedId = EXTERIOR_360_THUMBNAIL_MAP[modelSlug]?.[bodyColor.thumbnail];
  if (!mappedId) return undefined;

  const match = sets.find((set) => set.id === mappedId);
  return match?.frames;
}

export function buildSuzukiMaterialFrameUrl(
  modelSlug: string,
  materialKey: string,
  angle: number,
): string {
  const lineup = SUZUKI_VIEWER_LINEUP[modelSlug] ?? modelSlug;
  const padded = String(angle).padStart(2, '0');
  const base = `https://www.globalsuzuki.com/automobile/lineup/${lineup}/viewer/assets/materials/${materialKey}/${materialKey}_${padded}`;
  return `${base}.jpg`;
}

export { has360Support };
