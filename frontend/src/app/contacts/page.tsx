import { dealer } from '@suzuki/shared';

import { PlaceholderPage } from '@/components/ui/PageShell';



export const metadata = { title: 'Contact' };



export default function ContactsPage() {

  return (

    <PlaceholderPage

      title="Contact"

      breadcrumbs={[

        { label: 'Home', href: '/' },

        { label: 'Contact' },

      ]}

    >

      <div className="grid gap-6 md:grid-cols-2">

        <div className="rounded-xl bg-white p-6 shadow-sm">

          <h2 className="font-suzuki-bold text-sm uppercase tracking-wide">{dealer.name}</h2>

          <p className="mt-4 text-sm text-suzuki-gray-dark">{dealer.address}</p>

          <p className="mt-2 text-sm">

            <a href={`tel:${dealer.phone}`} className="text-suzuki-blue">

              {dealer.phone}

            </a>

          </p>

          <p className="text-sm">

            <a href={`mailto:${dealer.email}`} className="text-suzuki-blue">

              {dealer.email}

            </a>

          </p>

          <p className="mt-4 text-sm text-suzuki-gray-dark">{dealer.workingHours}</p>

        </div>

        <div className="flex h-64 items-center justify-center rounded-xl bg-suzuki-gray text-sm text-suzuki-gray-dark">

          Map (Google Maps)

        </div>

      </div>

    </PlaceholderPage>

  );

}

