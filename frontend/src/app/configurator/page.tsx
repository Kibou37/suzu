import { ConfiguratorForm } from '@/components/conversion/ConfiguratorForm';
import { getCars } from '@/lib/api';

type ConfiguratorPageProps = {
  searchParams: Promise<{ model?: string }>;
};

export const metadata = { title: 'Configurator' };

export default async function ConfiguratorPage({ searchParams }: ConfiguratorPageProps) {
  const params = await searchParams;
  const cars = await getCars({ condition: 'NEW' });

  return (
    <div className="configurator-page">
      <ConfiguratorForm cars={cars} initialModelSlug={params.model} />
    </div>
  );
}
