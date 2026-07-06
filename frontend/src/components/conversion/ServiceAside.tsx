import { dealer } from '@suzuki/shared';
import Link from 'next/link';

export function ServiceAside() {
  return (
    <aside className="service-aside">
      <div className="service-aside__card">
        <h2 className="service-aside__title heading-nav">Service centre</h2>
        <p className="service-aside__name">{dealer.name}</p>
        <p className="service-aside__text">{dealer.address}</p>
        <p className="service-aside__text">{dealer.workingHours}</p>
        <p className="service-aside__links">
          <a href={`tel:${dealer.phone}`} className="service-aside__link">
            {dealer.phone}
          </a>
          <a href={`mailto:${dealer.email}`} className="service-aside__link">
            {dealer.email}
          </a>
        </p>
      </div>

      <div className="service-aside__card service-aside__card--muted">
        <h3 className="service-aside__subtitle heading-nav">Before your visit</h3>
        <ul className="service-aside__list">
          <li>Bring your vehicle registration and service book if available.</li>
          <li>VIN helps us prepare parts in advance — you can find it on the windscreen or door frame.</li>
          <li>For warranty work, mention it in the notes field.</li>
        </ul>
        <Link href="/contacts" className="service-aside__cta">
          Contact service centre
        </Link>
      </div>
    </aside>
  );
}
