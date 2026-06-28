import { getLineupCarImage } from '@/lib/lineup-assets';
import { withBasePath } from '@/lib/base-path';

export function getCarImageUrl(images: unknown, fallbackText: string, slug?: string): string {
  if (slug) {
    const fromImages = Array.isArray(images) && typeof images[0] === 'string' ? images[0] : undefined;
    return getLineupCarImage(slug, fromImages ? [fromImages] : undefined);
  }

  if (Array.isArray(images) && images.length > 0) {
    const first = images[0];
    if (typeof first === 'string' && first.length > 0) {
      return first.startsWith('/') ? withBasePath(first) : first;
    }
  }

  const label = encodeURIComponent(fallbackText);
  return `https://placehold.co/800x450/png/004C97/ffffff?text=${label}`;
}
