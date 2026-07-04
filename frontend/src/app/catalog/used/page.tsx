import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { CatalogWithFilters } from '@/components/catalog/CatalogWithFilters';
import { getCars } from '@/lib/api';

export const metadata = { title: 'Used Vehicles' };

export default async function UsedCatalogPage() {
  const cars = await getCars({ condition: 'USED' });

  return (
    <CatalogLayout
      title="Used"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobiles', href: '/catalog' },
        { label: 'Used' },
      ]}
    >
      <CatalogWithFilters cars={cars} activeTab="/catalog/used" showMileage />
    </CatalogLayout>
  );
}
