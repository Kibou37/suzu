import { PlaceholderPage } from '@/components/ui/PageShell';



export const metadata = { title: 'Configurator' };



export default function ConfiguratorPage() {

  return (

    <PlaceholderPage

      title="Configurator"

      description="Choose trim, colour and options — see pricing updated in real time."

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'Configurator' },

      ]}

    />

  );

}

