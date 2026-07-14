import rawContent from '@/data/car-model-content.raw.json';
import viewerAssets from '@/data/car-viewer-assets.json';
import { withBasePath } from '@/lib/base-path';

export type InteriorPanorama = {
  imageUrl: string;
  title?: string;
};

type RawModelContent = {
  slug?: string;
  interiorPanorama?: InteriorPanorama;
};

type ViewerAssetsManifest = {
  interiorPanorama: Record<string, InteriorPanorama>;
};

const modelContent = rawContent as Record<string, RawModelContent>;
const localAssets = viewerAssets as ViewerAssetsManifest;

export function getInteriorPanorama(modelSlug: string): InteriorPanorama | undefined {
  const local = localAssets.interiorPanorama[modelSlug];
  if (local?.imageUrl) {
    return {
      imageUrl: withBasePath(local.imageUrl),
      title: local.title,
    };
  }

  const remote = modelContent[modelSlug]?.interiorPanorama;
  if (!remote?.imageUrl) return undefined;

  return {
    imageUrl: remote.imageUrl.startsWith('http') ? remote.imageUrl : withBasePath(remote.imageUrl),
    title: remote.title,
  };
}
