import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { CatalogWithFilters } from '@/components/catalog/CatalogWithFilters';
import { getCars, getCatalogFacets } from '@/lib/api';

export const metadata = {
  title: 'Special Offers',
  description: 'Current Suzuki promotions and special offers.',
};

export default async function OffersCatalogPage() {
  const [cars, serverFacets] = await Promise.all([
    getCars({ isOffer: true }),
    getCatalogFacets({ isOffer: true }),
  ]);

  return (
    <CatalogLayout
      title="Offers"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobiles', href: '/catalog' },
        { label: 'Offers' },
      ]}
    >
      <CatalogWithFilters
        cars={cars}
        activeTab="/catalog/offers"
        serverFacets={serverFacets}
      />
    </CatalogLayout>
  );
}
