type CarFacetSource = {
  bodyType: string;
  fuelType: string;
  transmission: string;
  trim: string | null;
  price: { toNumber?: () => number } | number | string;
  year: number;
  mileage: number;
};

export type CarFacets = {
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
  trims: string[];
  priceRange: { min: number; max: number };
  yearRange: { min: number; max: number };
  mileageRange: { min: number; max: number };
};

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return [
    ...new Set(values.filter((value): value is string => Boolean(value))),
  ].sort();
}

function readPrice(price: CarFacetSource['price']): number {
  if (
    typeof price === 'object' &&
    price !== null &&
    'toNumber' in price &&
    typeof price.toNumber === 'function'
  ) {
    return price.toNumber();
  }
  return Number(price);
}

export function computeCarFacets(cars: CarFacetSource[]): CarFacets {
  const prices = cars
    .map((car) => readPrice(car.price))
    .filter((price) => price > 0);
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

export function buildCarsCacheKey(
  prefix: string,
  params: Record<string, unknown>,
): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, key) => {
      const value = params[key];
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

  return `${prefix}:${JSON.stringify(sorted)}`;
}
