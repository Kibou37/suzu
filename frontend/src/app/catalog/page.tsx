import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { CatalogWithFilters } from '@/components/catalog/CatalogWithFilters';
import { getCars } from '@/lib/api';

export const metadata = { title: 'Model Lineup' };

export default async function CatalogPage() {
  const cars = await getCars({ condition: 'NEW' });

  return (
    <CatalogLayout
      title="Automobiles"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobiles' },
      ]}
    >
      <CatalogWithFilters cars={cars} activeTab="/catalog" />
    </CatalogLayout>
  );
}
