import { PlaceholderPage } from '@/components/ui/PageShell';



export const metadata = { title: 'Service & Maintenance' };



export default function ServicePage() {

  return (

    <PlaceholderPage

      title="Service & Maintenance"

      description="Service promotions and online booking for scheduled maintenance."

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'Service' },

      ]}

    />

  );

}

