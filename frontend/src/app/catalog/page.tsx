import { CatalogLayout } from '@/components/catalog/CatalogLayout';

import { LineupList } from '@/components/catalog/LineupList';

import { getCars } from '@/lib/api';



export const metadata = { title: 'Model Lineup' };



export default async function CatalogPage() {

  const cars = await getCars({ condition: 'NEW' });



  return (

    <CatalogLayout

      title="Automobiles"

      activeTab="/catalog"

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'Automobiles' },

      ]}

    >

      <LineupList cars={cars} />

    </CatalogLayout>

  );

}

