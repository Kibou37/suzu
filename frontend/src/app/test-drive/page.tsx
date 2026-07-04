import { TestDriveForm } from '@/components/conversion/TestDriveForm';
import { PageHeader } from '@/components/ui/PageShell';
import { getCars } from '@/lib/api';

type TestDrivePageProps = {
  searchParams: Promise<{ model?: string }>;
};

export const metadata = { title: 'Test Drive' };

export default async function TestDrivePage({ searchParams }: TestDrivePageProps) {
  const params = await searchParams;
  const cars = await getCars({ condition: 'NEW' });

  return (
    <div className="page-shell">
      <div className="container-suzuki">
        <PageHeader
          title="Book a Test Drive"
          description="Choose a model, date and time — we will confirm your booking by email."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Test Drive' },
          ]}
        />
        <TestDriveForm cars={cars} initialModelSlug={params.model} />
      </div>
    </div>
  );
}
