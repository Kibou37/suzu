import { CatalogLayout } from '@/components/catalog/CatalogLayout';
import { CatalogWithFilters } from '@/components/catalog/CatalogWithFilters';
import { getCars } from '@/lib/api';

export const metadata = { title: 'Special Offers' };

export default async function OffersCatalogPage() {
  const cars = await getCars({ isOffer: true });

  return (
    <CatalogLayout
      title="Offers"
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Automobiles', href: '/catalog' },
        { label: 'Offers' },
      ]}
    >
      <CatalogWithFilters cars={cars} activeTab="/catalog/offers" />
    </CatalogLayout>
  );
}
