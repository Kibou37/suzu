import { carSpecsByModel, type CarSpecGroup } from '@/data/car-specs';
import type { CarDetail } from '@/lib/api';
import { resolveLineupSlug } from '@/lib/lineup-assets';
import {
  formatBodyType,
  formatCondition,
  formatFuelType,
  formatMileage,
  formatTransmission,
} from '@/lib/format';

export function getCarSpecGroups(car: CarDetail): CarSpecGroup[] {
  const baseSlug = resolveLineupSlug(car.slug);
  const modelGroups = carSpecsByModel[baseSlug] ?? [];

  const general: CarSpecGroup = {
    title: 'General',
    items: [
      { label: 'Model', value: `Suzuki ${car.name}` },
      { label: 'Trim', value: car.trim ?? '—' },
      { label: 'Condition', value: formatCondition(car.condition) },
      { label: 'Model year', value: String(car.year) },
      ...(car.mileage > 0 ? [{ label: 'Mileage', value: formatMileage(car.mileage) }] : []),
      { label: 'Body type', value: formatBodyType(car.bodyType) },
      { label: 'Fuel type', value: formatFuelType(car.fuelType) },
      { label: 'Transmission', value: formatTransmission(car.transmission) },
      ...(car.horsepower ? [{ label: 'Rated power', value: `${car.horsepower} hp` }] : []),
    ],
  };

  return [general, ...modelGroups];
}
