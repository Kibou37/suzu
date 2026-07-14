import { demoCars } from '@/data/demo-cars';
import { applyCarQueryFilters, type CarQueryFilters } from '@/lib/catalog-filters';
import { getApiBaseUrl, isDemoDataMode } from '@/lib/config';

export type CarListItem = {
  id: string;
  slug: string;
  name: string;
  trim: string | null;
  price: string | number;
  year: number;
  mileage: number;
  condition: 'NEW' | 'USED';
  bodyType: string;
  fuelType: string;
  transmission: string;
  horsepower: number | null;
  isFeatured: boolean;
  isOffer: boolean;
  offerLabel: string | null;
  description: string | null;
  images: string[];
};

export async function getCars(params?: CarQueryFilters): Promise<CarListItem[]> {
  if (isDemoDataMode()) {
    return applyCarQueryFilters(demoCars, params);
  }

  const search = new URLSearchParams();
  if (params?.condition) search.set('condition', params.condition);
  if (params?.isOffer !== undefined) search.set('isOffer', String(params.isOffer));
  if (params?.minPrice !== undefined) search.set('minPrice', String(params.minPrice));
  if (params?.maxPrice !== undefined) search.set('maxPrice', String(params.maxPrice));
  if (params?.minYear !== undefined) search.set('minYear', String(params.minYear));
  if (params?.maxYear !== undefined) search.set('maxYear', String(params.maxYear));
  if (params?.maxMileage !== undefined) search.set('maxMileage', String(params.maxMileage));
  if (params?.bodyType) search.set('bodyType', params.bodyType);
  if (params?.fuelType) search.set('fuelType', params.fuelType);
  if (params?.transmission) search.set('transmission', params.transmission);
  if (params?.trim) search.set('trim', params.trim);

  const query = search.toString();
  const url = `${getApiBaseUrl()}/api/cars${query ? `?${query}` : ''}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export type CarDetail = CarListItem;

export async function getCar(slug: string): Promise<CarDetail | null> {
  if (isDemoDataMode()) {
    return demoCars.find((car) => car.slug === slug) ?? null;
  }

  try {
    const res = await fetch(`${getApiBaseUrl()}/api/cars/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
