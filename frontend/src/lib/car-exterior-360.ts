import rawContent from '@/data/car-model-content.raw.json';
import viewerAssets from '@/data/car-viewer-assets.json';
import generatedColorMap from '@/data/exterior-360-color-map.generated.json';
import { EXTERIOR_360_THUMBNAIL_MAP } from '@/data/exterior-360-color-map';
import { withBasePath } from '@/lib/base-path';
import type { ConfigColor } from '@/data/demo-configurator';

const GLOBALSUZUKI_VIEWER_SLUG: Record<string, string> = {
  vitara: 'vitara',
  jimny: 'jimny',
  swift: 'swift',
  's-cross': 's-cross',
};

const FRAME_COUNT = 36;

/** Minimum local frames required for drag-to-rotate spin. */
export const MIN_EXTERIOR_360_SPIN_FRAMES = FRAME_COUNT;

/** Official Global Suzuki 360° viewer (opens in a new tab). */
export function getSuzukiViewerUrl(modelSlug: string): string | undefined {
  const lineupSlug = GLOBALSUZUKI_VIEWER_SLUG[modelSlug];
  if (!lineupSlug) return undefined;
  return `https://www.globalsuzuki.com/automobile/lineup/${lineupSlug}/viewer/large/main.html`;
}

export function buildGlobalsuzukiFrameUrls(
  modelSlug: string,
  materialKey: string,
): string[] {
  const lineupSlug = GLOBALSUZUKI_VIEWER_SLUG[modelSlug];
  if (!lineupSlug) return [];

  const base = `https://www.globalsuzuki.com/automobile/lineup/${lineupSlug}/viewer/assets/materials/${materialKey}/${materialKey}`;
  return Array.from(
    { length: FRAME_COUNT },
    (_, index) => `${base}_${String(index + 1).padStart(2, '0')}.jpg`,
  );
}

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

type ViewerAssetsManifest = {
  exterior360: Record<string, Record<string, string[]>>;
  exterior360Stub?: Record<string, string>;
};

const exterior360ByModel = rawContent as Record<string, RawModelContent>;
const localAssets = viewerAssets as ViewerAssetsManifest;

export function hasExterior360Stub(modelSlug: string): boolean {
  return Boolean(localAssets.exterior360Stub?.[modelSlug]);
}

export function getExterior360StubPath(modelSlug: string): string | undefined {
  const stub = localAssets.exterior360Stub?.[modelSlug];
  return stub ? withBasePath(stub) : undefined;
}

export function getExterior360Colors(modelSlug: string): Exterior360ColorSet[] {
  return exterior360ByModel[modelSlug]?.exterior360 ?? [];
}

const generatedThumbnailMap = generatedColorMap as Record<string, Record<string, string>>;

function mapBodyColorToSetId(modelSlug: string, bodyColor?: ConfigColor): string | undefined {
  if (!bodyColor?.thumbnail) return undefined;
  return (
    EXTERIOR_360_THUMBNAIL_MAP[modelSlug]?.[bodyColor.thumbnail] ??
    generatedThumbnailMap[modelSlug]?.[bodyColor.thumbnail]
  );
}

/** Static studio preview when full 360° spin is unavailable. */
export function resolveExterior360Preview(
  modelSlug: string,
  bodyColor?: ConfigColor,
): string | undefined {
  const setId = mapBodyColorToSetId(modelSlug, bodyColor);
  if (setId) {
    const first = localAssets.exterior360[modelSlug]?.[setId]?.[0];
    if (first) return withBasePath(first);
  }

  return getExterior360StubPath(modelSlug);
}

/** Resolve local 360° frame paths for the selected body colour. */
export function resolveExterior360Frames(
  modelSlug: string,
  bodyColor?: ConfigColor,
): string[] | undefined {
  const setId = mapBodyColorToSetId(modelSlug, bodyColor);

  if (setId) {
    const localFrames = localAssets.exterior360[modelSlug]?.[setId];
    if (localFrames?.length >= MIN_EXTERIOR_360_SPIN_FRAMES) {
      return localFrames.map((frame) => withBasePath(frame));
    }

    const remoteSet = getExterior360Colors(modelSlug).find((set) => set.id === setId);
    if (remoteSet?.frames?.length >= MIN_EXTERIOR_360_SPIN_FRAMES) {
      return remoteSet.frames;
    }
  }

  return undefined;
}
