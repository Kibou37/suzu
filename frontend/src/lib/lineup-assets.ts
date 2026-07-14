import { withBasePath } from '@/lib/base-path';

const SLUG_ALIASES: Record<string, string> = {
  'vitara-used': 'vitara',
  'swift-offer': 'swift',
};

export function resolveLineupSlug(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}

export function getLineupCarImage(slug: string, images?: string[]): string {
  if (images?.[0]?.startsWith('/')) {
    return withBasePath(images[0]);
  }
  const base = resolveLineupSlug(slug);
  return withBasePath(`/images/cars/${base}.jpg`);
}
