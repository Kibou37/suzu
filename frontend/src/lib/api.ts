import { demoCars } from '@/data/demo-cars';

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
  isFeatured: boolean;
  isOffer: boolean;
  offerLabel: string | null;
  description: string | null;
  images: string[];
};

function isDemoDataMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_DEMO_DATA === 'true';
}

function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
  }

  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

export async function getCars(params?: {
  condition?: string;
  isOffer?: boolean;
}): Promise<CarListItem[]> {
  if (isDemoDataMode()) {
    let cars = [...demoCars];
    if (params?.condition) {
      cars = cars.filter((car) => car.condition === params.condition);
    }
    if (params?.isOffer !== undefined) {
      cars = cars.filter((car) => car.isOffer === params.isOffer);
    }
    return cars;
  }

  const search = new URLSearchParams();
  if (params?.condition) search.set('condition', params.condition);
  if (params?.isOffer !== undefined) search.set('isOffer', String(params.isOffer));

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
