import type { Metadata } from 'next';
import { brand, dealer } from '@suzuki/shared';

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim() ||
    'http://localhost:3000';
  return raw.replace(/\/$/, '');
}

export function absoluteUrl(path = '/'): string {
  const base = getSiteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const defaultOpenGraph: NonNullable<Metadata['openGraph']> = {
  type: 'website',
  locale: 'en_US',
  siteName: dealer.name,
  title: `${dealer.name} — Official ${brand.name} Dealer`,
  description: `Official ${brand.name} dealer — browse models, configure, book a test drive and service.`,
  url: absoluteUrl('/'),
};

export const defaultTwitter: NonNullable<Metadata['twitter']> = {
  card: 'summary_large_image',
  title: `${dealer.name} — Official ${brand.name} Dealer`,
  description: `Official ${brand.name} dealer — browse models, configure, book a test drive and service.`,
};
