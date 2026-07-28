import { apiUrl, isDemoDataMode } from '@/lib/config';
import type { PromoSlide } from '@/components/home/PromoSlider';
import { withBasePath } from '@/lib/base-path';

export type HomeBanner = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  linkUrl: string | null;
  linkLabel: string | null;
  imageDesktop: string;
  imageMobile: string | null;
  sortOrder: number;
};

function resolveAssetUrl(url: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return withBasePath(url.startsWith('/') ? url : `/${url}`);
}

export function mapBannerToSlide(item: HomeBanner): PromoSlide {
  const desktop = resolveAssetUrl(item.imageDesktop);
  const mobile = item.imageMobile ? resolveAssetUrl(item.imageMobile) : desktop;

  return {
    id: item.id,
    eyebrow: item.title,
    title: item.subtitle?.trim() || 'Special offer',
    description: item.description?.trim() || '',
    href: item.linkUrl?.trim() || '/catalog/offers',
    linkLabel: item.linkLabel?.trim() || 'Learn More',
    imageUrl: desktop,
    imageMobileUrl: mobile,
  };
}

export async function getHomeBanners(): Promise<HomeBanner[]> {
  if (isDemoDataMode()) return [];

  try {
    const res = await fetch(apiUrl('/api/home-banners'), { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function getHomePromoSlides(): Promise<PromoSlide[]> {
  const banners = await getHomeBanners();
  return banners.map(mapBannerToSlide);
}
