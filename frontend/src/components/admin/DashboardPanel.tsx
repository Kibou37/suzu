'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AdminAlert, AdminEmpty, AdminPageHeader } from '@/components/admin/AdminUi';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { getDashboardSummary, type DashboardSummary } from '@/lib/admin-api';
import { roleCanAccessSection } from '@/lib/admin-permissions';

type StatCard = {
  key: keyof DashboardSummary;
  label: string;
  href?: string;
  highlight?: boolean;
};

const primaryCards: StatCard[] = [
  { key: 'quotesToday', label: 'Quotes today', href: '/admin/quotes', highlight: true },
  {
    key: 'upcomingTestDrives',
    label: 'Test drives (7 days)',
    href: '/admin/bookings',
    highlight: true,
  },
  {
    key: 'activePromotions',
    label: 'Active promotions',
    href: '/admin/promotions',
    highlight: true,
  },
  { key: 'pendingBookings', label: 'Pending bookings', href: '/admin/bookings' },
  { key: 'pendingQuotes', label: 'Pending quotes', href: '/admin/quotes' },
  { key: 'homeBanners', label: 'Homepage banners', href: '/admin/banners' },
];

const inventoryCards: StatCard[] = [
  { key: 'cars', label: 'Catalog models', href: '/admin/cars' },
  { key: 'blogPosts', label: 'Blog posts', href: '/admin/blog' },
  { key: 'faqs', label: 'FAQ entries', href: '/admin/faq' },
  { key: 'promotions', label: 'All promotions', href: '/admin/promotions' },
  { key: 'bookings', label: 'All bookings', href: '/admin/bookings' },
  { key: 'quoteRequests', label: 'All quotes', href: '/admin/quotes' },
];

function StatGrid({ cards, summary }: { cards: StatCard[]; summary: DashboardSummary | null }) {
  return (
    <div className="admin-dashboard-grid">
      {cards.map((card) => {
        const value = summary ? summary[card.key] : '—';
        const body = (
          <>
            <p className="admin-stat-card__value">{value}</p>
            <p className="admin-stat-card__label">{card.label}</p>
          </>
        );

        if (card.href) {
          return (
            <Link
              key={card.key}
              href={card.href}
              className={`admin-stat-card admin-stat-card--link${card.highlight ? ' admin-stat-card--highlight' : ''}`}
            >
              {body}
            </Link>
          );
        }

        return (
          <div
            key={card.key}
            className={`admin-stat-card${card.highlight ? ' admin-stat-card--highlight' : ''}`}
          >
            {body}
          </div>
        );
      })}
    </div>
  );
}

export function DashboardPanel() {
  const { user } = useAdminAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    getDashboardSummary()
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const showOperations = user ? roleCanAccessSection(user.role, 'operations') : false;
  const showContent = user ? roleCanAccessSection(user.role, 'content') : false;

  const visiblePrimary = primaryCards.filter((card) => {
    if (card.href?.startsWith('/admin/quotes') || card.href?.startsWith('/admin/bookings')) {
      return showOperations;
    }
    if (card.href?.startsWith('/admin/promotions') || card.href?.startsWith('/admin/banners')) {
      return showContent;
    }
    return true;
  });

  return (
    <div>
      <AdminPageHeader
        title="Dashboard"
        description="Live overview of catalog, content, and customer activity."
      />

      {error && <AdminAlert message={error} />}

      <h2 className="admin-dashboard-section-title">Today &amp; upcoming</h2>
      <StatGrid cards={visiblePrimary} summary={summary} />

      <h2 className="admin-dashboard-section-title">Inventory</h2>
      <StatGrid cards={inventoryCards} summary={summary} />

      {!summary && !error && <AdminEmpty>Loading dashboard…</AdminEmpty>}
    </div>
  );
}
