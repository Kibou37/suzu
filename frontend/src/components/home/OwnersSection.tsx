import Image from 'next/image';
import Link from 'next/link';

const ownerLinks = [
  { href: '/service', label: 'Service Pricing', icon: 'price' },
  { href: '/service', label: 'Book Service', icon: 'calendar' },
  { href: '/service', label: 'Parts Pricing', icon: 'parts' },
] as const;

function ServiceIcon({ name }: { name: (typeof ownerLinks)[number]['icon'] }) {
  if (name === 'price') {
    return (
      <svg className="service-bar__icon" width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <path d="M17 2C8.716 2 2 8.716 2 17s6.716 15 15 15 15-6.716 15-15S25.284 2 17 2zm1.35 22.5H15.65v-1.95c-2.1-.3-3.75-1.35-3.75-3.45 0-1.95 1.65-3.15 4.35-3.45l1.8-.15c1.05-.15 1.5-.45 1.5-1.05 0-.75-.75-1.2-2.1-1.2-1.5 0-2.55.6-2.85 1.65H12.8c.45-2.55 2.55-3.9 5.55-3.9 3.15 0 5.1 1.5 5.1 3.9 0 2.1-1.5 3.3-4.05 3.6l-1.65.15c-1.05.15-1.5.45-1.5 1.05 0 .75.75 1.2 2.25 1.35v2.1z" />
      </svg>
    );
  }

  if (name === 'calendar') {
    return (
      <svg className="service-bar__icon" width="34" height="34" viewBox="0 0 34 34" aria-hidden>
        <path d="M8 4v3H5a3 3 0 0 0-3 3v18a3 3 0 0 0 3 3h24a3 3 0 0 0 3-3V10a3 3 0 0 0-3-3h-3V4h-4v3H12V4H8zm-1 10h20v13H7V14zm4 3v4h4v-4h-4zm8 0v4h4v-4h-4z" />
      </svg>
    );
  }

  return (
    <svg className="service-bar__icon" width="34" height="34" viewBox="0 0 34 34" aria-hidden>
      <path d="M28.5 18.5 24 14l-5.5 5.5-3-3L10 22.5 12.5 25l3-3 5.5 5.5L24 19l4.5 4.5 2.5-2.5-2.5-2.5zM8 4h3v3h12V4h3v3h4a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H4a3 3 0 0 1-3-3V10a3 3 0 0 1 3-3h4V4z" />
    </svg>
  );
}

function ServiceBarItem({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: (typeof ownerLinks)[number]['icon'];
}) {
  return (
    <li>
      <Link href={href} className="service-bar__item">
        <ServiceIcon name={icon} />
        <span className="service-bar__label">{label}</span>
      </Link>
    </li>
  );
}

export function OwnersSection() {
  return (
    <>
      <div className="page-title-center">
        <h2>For Owners</h2>
      </div>

      <section className="owners-banner">
        <div className="owners-banner__media">
          <Image
            src="https://img.perxis.ru/unsafe/1800x0/prxs/originals/cfj21aanifss73cof430/original"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="owners-banner__content">
          <div className="container-suzuki">
            <h2 className="owners-banner__title">
              WE TAKE CARE
              <br />
              OF YOUR SUZUKI
            </h2>
          </div>
        </div>
      </section>

      <section className="service-bar">
        <div className="container-suzuki">
          <ul className="service-bar__list">
            {ownerLinks.map((link) => (
              <ServiceBarItem key={link.label} href={link.href} label={link.label} icon={link.icon} />
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
