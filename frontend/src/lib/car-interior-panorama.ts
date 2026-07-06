import rawContent from '@/data/car-model-content.raw.json';

export type InteriorPanorama = {
  imageUrl: string;
  title?: string;
};

type RawModelContent = {
  slug?: string;
  interiorPanorama?: InteriorPanorama;
};

const modelContent = rawContent as Record<string, RawModelContent>;

/** Local copies for reliable static hosting (overrides remote CDN when present). */
const LOCAL_INTERIOR_PANORAMA: Partial<Record<string, string>> = {
  jimny: '/panoramas/jimny.jpg',
};

export function getInteriorPanorama(modelSlug: string): InteriorPanorama | undefined {
  const remote = modelContent[modelSlug]?.interiorPanorama;
  const localUrl = LOCAL_INTERIOR_PANORAMA[modelSlug];

  if (localUrl) {
    return { imageUrl: localUrl, title: remote?.title };
  }

  return remote;
}

export function hasInteriorPanorama(modelSlug: string): boolean {
  return Boolean(getInteriorPanorama(modelSlug));
}
