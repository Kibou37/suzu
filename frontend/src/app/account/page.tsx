import { PlaceholderPage } from '@/components/ui/PageShell';



export const metadata = { title: 'My Account' };



export default function AccountPage() {

  return (

    <PlaceholderPage

      title="My Account"

      description="Request history, saved configurations and service status."

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'My Account' },

      ]}

    />

  );

}

