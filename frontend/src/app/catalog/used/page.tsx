import { CatalogLayout } from '@/components/catalog/CatalogLayout';

import { LineupList } from '@/components/catalog/LineupList';

import { getCars } from '@/lib/api';



export const metadata = { title: 'Used Vehicles' };



export default async function UsedCatalogPage() {

  const cars = await getCars({ condition: 'USED' });



  return (

    <CatalogLayout

      title="Used"

      activeTab="/catalog/used"

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'Automobiles', href: '/catalog' },

        { label: 'Used' },

      ]}

    >

      <LineupList cars={cars} />

    </CatalogLayout>

  );

}

