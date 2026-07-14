import Link from 'next/link';
import { AccountNavLink } from '@/components/account/AccountNavLink';
import { SuzukiLogo } from '@/components/brand/SuzukiLogo';
import { MobileNav } from '@/components/layout/MobileNav';
import { navItems } from '@suzuki/shared';

const mainNavItems = navItems.filter((item) => item.href !== '/account');
const accountItem = navItems.find((item) => item.href === '/account');

export function Header() {
  return (
    <header className="site-header">
      <div className="container-suzuki site-header__inner">
        <Link href="/" className="site-header__logo">
          <SuzukiLogo priority />
        </Link>

        <nav className="site-nav site-nav--desktop" aria-label="Main">
          <ul className="site-nav__list">
            {mainNavItems.map((item) => (
              <li key={item.href} className="site-nav__item">
                <Link href={item.href} className="site-nav__link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {accountItem && (
          <AccountNavLink
            label={accountItem.label}
            className="site-nav__link site-header__account"
          />
        )}

        <MobileNav />
      </div>
    </header>
  );
}
