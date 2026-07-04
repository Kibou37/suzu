import { Suspense } from 'react';
import { ConfiguratorForm } from '@/components/conversion/ConfiguratorForm';
import { getCars } from '@/lib/api';

export const metadata = { title: 'Configurator' };

export default async function ConfiguratorPage() {
  const cars = await getCars({ condition: 'NEW' });

  return (
    <div className="configurator-page">
      <Suspense fallback={null}>
        <ConfiguratorForm cars={cars} />
      </Suspense>
    </div>
  );
}
