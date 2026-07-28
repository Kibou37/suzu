import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { CatalogWithFilters } from '@/components/catalog/CatalogWithFilters';
import { getCars, getCatalogFacets } from '@/lib/api';

export const metadata = {
  title: 'Used Vehicles',
  description: 'Pre-owned Suzuki vehicles with transparent mileage and pricing.',
};

export default async function UsedCatalogPage() {
  const [cars, serverFacets] = await Promise.all([
    getCars({ condition: 'USED' }),
    getCatalogFacets({ condition: 'USED' }),
  ]);

  return (
    <CatalogLayout
      title="Used"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobiles', href: '/catalog' },
        { label: 'Used' },
      ]}
    >
      <CatalogWithFilters
        cars={cars}
        activeTab="/catalog/used"
        showMileage
        serverFacets={serverFacets}
      />
    </CatalogLayout>
  );
}
