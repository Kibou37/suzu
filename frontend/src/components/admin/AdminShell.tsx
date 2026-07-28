'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import {
  roleCanAccessPath,
  roleCanAccessSection,
  type AdminNavSection,
} from '@/lib/admin-permissions';

type NavItem = {
  href: string;
  label: string;
};

type NavGroup = {
  title: string;
  section: AdminNavSection;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: 'Overview',
    section: 'overview',
    items: [{ href: '/admin', label: 'Dashboard' }],
  },
  {
    title: 'Catalog',
    section: 'catalog',
    items: [{ href: '/admin/cars', label: 'Models' }],
  },
  {
    title: 'Content',
    section: 'content',
    items: [
      { href: '/admin/banners', label: 'Homepage banners' },
      { href: '/admin/media', label: 'Media library' },
      { href: '/admin/blog', label: 'News & blog' },
      { href: '/admin/faq', label: 'FAQ' },
      { href: '/admin/promotions', label: 'Promotions' },
    ],
  },
  {
    title: 'Operations',
    section: 'operations',
    items: [
      { href: '/admin/bookings', label: 'Bookings' },
      { href: '/admin/quotes', label: 'Quote requests' },
      { href: '/admin/slots', label: 'Service appointments' },
    ],
  },
  {
    title: 'Settings',
    section: 'settings',
    items: [{ href: '/admin/users', label: 'Staff users' }],
  },
];

function roleLabel(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'CONTENT_MANAGER':
      return 'Content manager';
    case 'DEALER_MANAGER':
      return 'Dealer manager';
    default:
      return role;
  }
}

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace('/admin/login');
    }
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    if (!roleCanAccessPath(user.role, pathname)) {
      router.replace('/admin');
    }
  }, [user, pathname, router]);

  if (isLoading) {
    return <div className="admin-shell__loading">Loading…</div>;
  }

  if (!user) {
    return null;
  }

  const visibleGroups = navGroups.filter((group) => roleCanAccessSection(user.role, group.section));

  return (
    <div className="admin-shell">
      <aside className="admin-shell__sidebar">
        <div className="admin-shell__brand">
          <p className="admin-shell__brand-kicker">Suzuki</p>
          <h1 className="admin-shell__brand-title">Admin</h1>
        </div>

        <nav className="admin-shell__nav" aria-label="Admin sections">
          {visibleGroups.map((group) => (
            <div key={group.title} className="admin-shell__nav-group">
              <p className="admin-shell__nav-group-title">{group.title}</p>
              <ul className="admin-shell__nav-list">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`admin-shell__nav-link${isActive ? ' admin-shell__nav-link--active' : ''}`}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="admin-shell__body">
        <header className="admin-shell__topbar">
          <p className="admin-shell__topbar-label">Site management</p>
          <div className="admin-shell__user">
            <div className="admin-shell__user-meta">
              <p className="admin-shell__user-name">
                {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
              </p>
              <p className="admin-shell__user-role">{roleLabel(user.role)}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                logout();
                router.replace('/admin/login');
              }}
              className="btn btn-secondary"
            >
              Sign out
            </button>
          </div>
        </header>

        <main className="admin-shell__main">{children}</main>
      </div>
    </div>
  );
}
