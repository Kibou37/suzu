import { dealer } from '@suzuki/shared';
import { ContactForm } from '@/components/contacts/ContactForm';
import { PageHeader } from '@/components/ui/PageShell';

export const metadata = { title: 'Contacts' };

export default function ContactsPage() {
  return (
    <div className="page-shell">
      <div className="container-suzuki">
        <PageHeader
          title="Contacts"
          description="Send a message or visit us using the details below."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Contacts' }]}
        />

        <div className="contacts-page">
          <aside className="contacts-page__details">
            <h2 className="contacts-page__heading">{dealer.name}</h2>
            <p>{dealer.address}</p>
            <p>
              <a href={`tel:${dealer.phone.replace(/\s+/g, '')}`}>{dealer.phone}</a>
            </p>
            <p>
              <a href={`mailto:${dealer.email}`}>{dealer.email}</a>
            </p>
            <p>{dealer.workingHours}</p>
            <p className="contacts-page__note">
              Details are placeholders from kickoff until the dealership provides final contacts.
            </p>
          </aside>

          <div className="contacts-page__form">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
