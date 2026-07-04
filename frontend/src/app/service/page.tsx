import { PageHeader } from '@/components/ui/PageShell';
import { ServiceForm } from '@/components/conversion/ServiceForm';

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
        <ServiceForm />
      </div>
    </div>
  );
}
