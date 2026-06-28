const SLUG_ALIASES: Record<string, string> = {
  'vitara-used': 'vitara',
  'swift-offer': 'swift',
};

/** CSS class on lineupList li — matches globalsuzuki width rules */
export const LINEUP_LOGO_CLASSES: Record<string, string> = {
  vitara: 'vitara',
  jimny: 'jimny',
  swift: 'swift',
  's-cross': 's-cross',
  'vitara-used': 'vitara',
  'swift-offer': 'swift',
};

export function resolveLineupSlug(slug: string): string {
  return SLUG_ALIASES[slug] ?? slug;
}

export function getLineupCarImage(slug: string, images?: string[]): string {
  if (images?.[0]?.startsWith('/')) {
    return images[0];
  }
  const base = resolveLineupSlug(slug);
  return `/images/cars/${base}.jpg`;
}

export function getLineupLogoImage(slug: string, images?: string[]): string {
  if (images?.[1]?.startsWith('/')) {
    return images[1];
  }
  const base = resolveLineupSlug(slug);
  return `/images/cars/${base}-logo.png`;
}

export function getLineupLogoClass(slug: string): string {
  return LINEUP_LOGO_CLASSES[slug] ?? resolveLineupSlug(slug);
}

export function getLineupAssets(slug: string, images?: string[]) {
  return {
    carImage: getLineupCarImage(slug, images),
    logoImage: getLineupLogoImage(slug, images),
    cssClass: getLineupLogoClass(slug),
  };
}
