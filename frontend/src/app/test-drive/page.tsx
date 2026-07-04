import { Suspense } from 'react';
import { TestDriveForm } from '@/components/conversion/TestDriveForm';
import { PageHeader } from '@/components/ui/PageShell';
import { getCars } from '@/lib/api';

export const metadata = { title: 'Test Drive' };

export default async function TestDrivePage() {
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
        <Suspense fallback={null}>
          <TestDriveForm cars={cars} />
        </Suspense>
      </div>
    </div>
  );
}
