import { dealer } from '@suzuki/shared';

import { PlaceholderPage } from '@/components/ui/PageShell';



export const metadata = { title: 'About the Dealership' };



export default function AboutPage() {

  return (

    <PlaceholderPage

      title="About the Dealership"

      description={`${dealer.name} — official Suzuki dealer.`}

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'About' },

      ]}

    >

      <div className="rounded-xl bg-white p-6 text-suzuki-gray-dark">

        <p>

          {dealer.name} offers a full range of services: new and used Suzuki vehicles, service

          and maintenance, genuine parts and accessories.

        </p>

      </div>

    </PlaceholderPage>

  );

}

