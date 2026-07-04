import type { CarListItem } from '@/lib/api';

export type CatalogFilters = {
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  trim?: string;
};

export type CatalogFilterFacets = {
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  trims: string[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
};

const FILTER_KEYS = [
  'minPrice',
  'maxPrice',
  'minYear',
  'maxYear',
  'maxMileage',
  'bodyType',
  'fuelType',
  'transmission',
  'trim',
] as const;

function readNumber(value: string | null): number | undefined {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function parseCatalogFilters(searchParams: URLSearchParams): CatalogFilters {
  return {
    minPrice: readNumber(searchParams.get('minPrice')),
    maxPrice: readNumber(searchParams.get('maxPrice')),
    minYear: readNumber(searchParams.get('minYear')),
    maxYear: readNumber(searchParams.get('maxYear')),
    maxMileage: readNumber(searchParams.get('maxMileage')),
    bodyType: searchParams.get('bodyType') ?? undefined,
    fuelType: searchParams.get('fuelType') ?? undefined,
    transmission: searchParams.get('transmission') ?? undefined,
    trim: searchParams.get('trim') ?? undefined,
  };
}

export function buildCatalogFilterQuery(filters: CatalogFilters): string {
  const params = new URLSearchParams();

  for (const key of FILTER_KEYS) {
    const value = filters[key];
    if (value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  }

  return params.toString();
}

export function hasActiveCatalogFilters(filters: CatalogFilters): boolean {
  return FILTER_KEYS.some((key) => filters[key] !== undefined && filters[key] !== '');
}

export function countActiveCatalogFilters(filters: CatalogFilters): number {
  return FILTER_KEYS.filter((key) => filters[key] !== undefined && filters[key] !== '').length;
}

export function applyCatalogFilters(cars: CarListItem[], filters: CatalogFilters): CarListItem[] {
  return cars.filter((car) => {
    const price = Number(car.price);

    if (filters.minPrice !== undefined && price < filters.minPrice) return false;
    if (filters.maxPrice !== undefined && price > filters.maxPrice) return false;
    if (filters.minYear !== undefined && car.year < filters.minYear) return false;
    if (filters.maxYear !== undefined && car.year > filters.maxYear) return false;
    if (filters.maxMileage !== undefined && car.mileage > filters.maxMileage) return false;
    if (filters.bodyType && car.bodyType !== filters.bodyType) return false;
    if (filters.fuelType && car.fuelType !== filters.fuelType) return false;
    if (filters.transmission && car.transmission !== filters.transmission) return false;
    if (filters.trim && car.trim !== filters.trim) return false;

    return true;
  });
}

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort();
}

export function getCatalogFilterFacets(cars: CarListItem[]): CatalogFilterFacets {
  const prices = cars.map((car) => Number(car.price)).filter((price) => price > 0);
  const years = cars.map((car) => car.year);
  const mileages = cars.map((car) => car.mileage);

  return {
    bodyTypes: uniqueSorted(cars.map((car) => car.bodyType)),
    fuelTypes: uniqueSorted(cars.map((car) => car.fuelType)),
    transmissions: uniqueSorted(cars.map((car) => car.transmission)),
    trims: uniqueSorted(cars.map((car) => car.trim)),
    priceRange: {
      min: prices.length ? Math.min(...prices) : 0,
      max: prices.length ? Math.max(...prices) : 0,
    },
    yearRange: {
      min: years.length ? Math.min(...years) : 0,
      max: years.length ? Math.max(...years) : 0,
    },
    mileageRange: {
      min: mileages.length ? Math.min(...mileages) : 0,
      max: mileages.length ? Math.max(...mileages) : 0,
    },
  };
}

export type CarQueryFilters = CatalogFilters & {
  condition?: string;
  isOffer?: boolean;
};

export function applyCarQueryFilters(cars: CarListItem[], params?: CarQueryFilters): CarListItem[] {
  let result = [...cars];

  if (params?.condition) {
    result = result.filter((car) => car.condition === params.condition);
  }

  if (params?.isOffer !== undefined) {
    result = result.filter((car) => car.isOffer === params.isOffer);
  }

  return applyCatalogFilters(result, params ?? {});
}
