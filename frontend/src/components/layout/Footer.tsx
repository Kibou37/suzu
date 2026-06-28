import Link from 'next/link';
import type { ReactNode } from 'react';
import { brand, dealer } from '@suzuki/shared';

const footerGroups = [
  {
    title: 'Company',
    links: [
      { href: '/about', label: 'About Us' },
      { href: '/contacts', label: 'Dealers' },
      { href: '/service', label: 'Service' },
    ],
  },
  {
    title: 'Press',
    links: [
      { href: '/blog', label: 'News' },
      { href: '/catalog/offers', label: 'Offers' },
    ],
  },
] as const;

const socialLinks = [
  { href: 'https://facebook.com', label: 'Facebook', icon: 'facebook' },
  { href: 'https://youtube.com', label: 'YouTube', icon: 'youtube' },
] as const;

function SocialIcon({ name }: { name: (typeof socialLinks)[number]['icon'] }) {
  if (name === 'facebook') {
    return (
      <svg className="footer-social__icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    );
  }

  return (
    <svg className="footer-social__icon" width="28" height="28" viewBox="0 0 24 24" aria-hidden>
      <path d="M21.58 7.2a2.72 2.72 0 0 0-1.91-1.92C18.25 5 12 5 12 5s-6.25 0-7.67.28A2.72 2.72 0 0 0 2.42 7.2 28.6 28.6 0 0 0 2 12a28.6 28.6 0 0 0 .42 4.8 2.72 2.72 0 0 0 1.91 1.92C5.75 19 12 19 12 19s6.25 0 7.67-.28a2.72 2.72 0 0 0 1.91-1.92A28.6 28.6 0 0 0 22 12a28.6 28.6 0 0 0-.42-4.8zM10 15.46V8.54L15.27 12 10 15.46z" />
    </svg>
  );
}

function FooterColumn({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="footer-column">
      <p className="footer-column__title">{title}</p>
      {children}
    </div>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container-suzuki site-footer__inner">
        <div className="site-footer__grid">
          {footerGroups.map((group) => (
            <FooterColumn key={group.title} title={group.title}>
              <ul className="footer-links">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="footer-links__link">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterColumn>
          ))}

          <div className="footer-aside">
            <FooterColumn title="Contact">
              <ul className="footer-contacts">
                <li>
                  <a href={`mailto:${dealer.email}`} className="footer-contacts__link">
                    {dealer.email}
                  </a>
                </li>
                <li>
                  <a href={`tel:${dealer.phone.replace(/\s/g, '')}`} className="footer-contacts__link">
                    {dealer.phone}
                  </a>
                </li>
                <li className="footer-contacts__hours">{dealer.workingHours}</li>
              </ul>
            </FooterColumn>

            <FooterColumn title="Follow Us">
              <div className="footer-social">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer-social__item"
                    aria-label={item.label}
                    title={item.label}
                  >
                    <SocialIcon name={item.icon} />
                  </a>
                ))}
              </div>
            </FooterColumn>
          </div>
        </div>

        <div className="site-footer__copy">
          © {new Date().getFullYear()} {dealer.name}. Official {brand.name} Dealer. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
