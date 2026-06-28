import { CatalogLayout } from '@/components/catalog/CatalogLayout';



export const metadata = { title: 'Special Offers' };



export default function OffersCatalogPage() {

  return (

    <CatalogLayout

      title="Offers"

      activeTab="/catalog/offers"

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'Automobiles', href: '/catalog' },

        { label: 'Offers' },

      ]}

    >

      <p className="placeholder-box">Special offers will be available soon.</p>

    </CatalogLayout>

  );

}

