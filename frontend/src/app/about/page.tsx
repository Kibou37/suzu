import { dealer, dealerServices } from '@suzuki/shared';
import Link from 'next/link';
import { ShowroomTourSection } from '@/components/about/ShowroomTourSection';
import { PageHeader } from '@/components/ui/PageShell';

export const metadata = { title: 'About the Dealership' };

export default function AboutPage() {
  return (
    <div className="page-shell">
      <div className="container-suzuki">
        <PageHeader
          title="About the Dealership"
          description={`${dealer.name} — official Suzuki dealer.`}
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
        />

        <div className="about-page">
          <section className="about-page__section">
            <h2 className="about-page__heading">Who we are</h2>
            <p>
              {dealer.name} is an authorised Suzuki dealership offering new and pre-owned vehicles,
              genuine parts, and manufacturer-backed service.
            </p>
            <p>
              Content on this page uses placeholder dealer details until real brand materials are
              provided. Replace address, phone and hours when the dealership profile is confirmed.
            </p>
          </section>

          <ShowroomTourSection />

          <section className="about-page__section">
            <h2 className="about-page__heading">Services</h2>
            <ul className="about-page__list">
              {dealerServices.map((service) => (
                <li key={service.id}>{service.label}</li>
              ))}
            </ul>
          </section>

          <section className="about-page__section">
            <h2 className="about-page__heading">Visit us</h2>
            <p>{dealer.address}</p>
            <p>
              <a href={`tel:${dealer.phone.replace(/\s+/g, '')}`}>{dealer.phone}</a>
              {' · '}
              <a href={`mailto:${dealer.email}`}>{dealer.email}</a>
            </p>
            <p>{dealer.workingHours}</p>
            <p>
              <Link href="/dealers" className="link-action">
                Find dealers on the map
              </Link>
              {' · '}
              <Link href="/contacts" className="link-action">
                Contact form
              </Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
