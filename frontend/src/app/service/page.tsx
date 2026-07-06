import { ServiceAside } from '@/components/conversion/ServiceAside';
import { ServiceForm } from '@/components/conversion/ServiceForm';
import { PageHeader } from '@/components/ui/PageShell';

export const metadata = { title: 'Service & Maintenance' };

export default function ServicePage() {
  return (
    <div className="page-shell">
      <div className="container-suzuki">
        <PageHeader
          title="Service & Maintenance"
          description="Book scheduled maintenance, diagnostics or warranty work at our authorised service centre."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'Service' },
          ]}
        />

        <div className="service-page">
          <div className="service-page__form">
            <ServiceForm />
          </div>
          <ServiceAside />
        </div>
      </div>
    </div>
  );
}
