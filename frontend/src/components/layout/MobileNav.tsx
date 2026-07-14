'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AccountNavLink } from '@/components/account/AccountNavLink';
import { navItems } from '@suzuki/shared';

export function MobileNav() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={`site-header__burger ${open ? 'site-header__burger--open' : ''}`}
        aria-expanded={open}
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="site-header__burger-line" aria-hidden="true" />
        <span className="site-header__burger-line" aria-hidden="true" />
        <span className="site-header__burger-line" aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="site-nav__backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <nav className="site-nav site-nav--mobile-open" aria-label="Mobile">
            <ul className="site-nav__list">
              {navItems.map((item) => (
                <li key={item.href} className="site-nav__item">
                  {item.href === '/account' ? (
                    <AccountNavLink
                      label={item.label}
                      className="site-nav__link"
                      onClick={() => setOpen(false)}
                    />
                  ) : (
                    <Link href={item.href} className="site-nav__link" onClick={() => setOpen(false)}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </>
      )}
    </>
  );
}
