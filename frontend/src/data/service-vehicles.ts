/**
 * Service appointment vehicle list — model + engine + gearbox.
 * Labels omit the brand (Suzuki service centre context).
 */
export type ServiceVehicle = {
  id: string;
  label: string;
};

export const SERVICE_VEHICLES: ServiceVehicle[] = [
  { id: 'jimny-1-5-mt', label: 'Jimny 1.5 MT' },
  { id: 'jimny-1-5-at', label: 'Jimny 1.5 AT' },
  { id: 's-cross-1-4-at', label: 'S-Cross 1.4 AT' },
  { id: 's-cross-1-5-hybrid-cvt', label: 'S-Cross 1.5 Hybrid CVT' },
  { id: 'swift-1-2-mt', label: 'Swift 1.2 MT' },
  { id: 'swift-1-2-cvt', label: 'Swift 1.2 CVT' },
  { id: 'vitara-1-4-at', label: 'Vitara 1.4 AT' },
  { id: 'vitara-1-4-mt', label: 'Vitara 1.4 MT' },
  { id: 'vitara-1-6-at', label: 'Vitara 1.6 AT' },
  { id: 'vitara-1-6-mt', label: 'Vitara 1.6 MT' },
];

export function getServiceVehicleLabel(id: string): string | undefined {
  return SERVICE_VEHICLES.find((item) => item.id === id)?.label;
}
