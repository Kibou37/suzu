import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { CatalogWithFilters } from '@/components/catalog/CatalogWithFilters';
import { getCars, getCatalogFacets } from '@/lib/api';

export const metadata = {
  title: 'Model Lineup',
  description: 'Browse new Suzuki models — configure, compare and book a test drive.',
};

export default async function CatalogPage() {
  const [cars, serverFacets] = await Promise.all([
    getCars({ condition: 'NEW' }),
    getCatalogFacets({ condition: 'NEW' }),
  ]);

  return (
    <CatalogLayout
      title="Automobiles"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobiles' },
      ]}
    >
      <CatalogWithFilters cars={cars} activeTab="/catalog" serverFacets={serverFacets} />
    </CatalogLayout>
  );
}
