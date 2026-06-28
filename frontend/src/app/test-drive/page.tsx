import { PlaceholderPage } from '@/components/ui/PageShell';



export const metadata = { title: 'Test Drive' };



export default function TestDrivePage() {

  return (

    <PlaceholderPage

      title="Book a Test Drive"

      description="Choose a model, date and time — we will confirm your booking by email."

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'Test Drive' },

      ]}

    />

  );

}

