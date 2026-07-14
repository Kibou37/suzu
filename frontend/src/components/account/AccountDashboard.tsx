'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountBookingsList } from '@/components/account/AccountBookingsList';
import { AccountProfileForm } from '@/components/account/AccountProfileForm';
import { PageHeader } from '@/components/ui/PageShell';
import { useAuth } from '@/context/AuthProvider';

type DashboardTab = 'bookings' | 'profile';

export function AccountDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<DashboardTab>('bookings');

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/account/login');
    }
  }, [loading, user, router]);

  const handleLogout = () => {
    logout();
    router.replace('/account/login');
  };

  if (loading || !user) {
    return (
      <div className="page-shell">
        <div className="container-suzuki">
          <p className="account-panel__empty">Loading…</p>
        </div>
      </div>
    );
  }

  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.phone ||
    user.email;

  return (
    <div className="page-shell">
      <div className="container-suzuki">
        <PageHeader
          title={displayName}
          description="View your bookings and manage your profile."
          breadcrumbs={[
            { label: 'Home', href: '/' },
            { label: 'My Account' },
          ]}
        />

        <div className="account-dashboard">
          <div className="account-dashboard__toolbar">
            <nav className="account-dashboard__tabs" aria-label="Account sections">
              <button
                type="button"
                className={`account-dashboard__tab${tab === 'bookings' ? ' account-dashboard__tab--active' : ''}`}
                onClick={() => setTab('bookings')}
              >
                My bookings
              </button>
              <button
                type="button"
                className={`account-dashboard__tab${tab === 'profile' ? ' account-dashboard__tab--active' : ''}`}
                onClick={() => setTab('profile')}
              >
                Profile
              </button>
            </nav>
            <button type="button" className="btn btn-secondary account-dashboard__logout" onClick={handleLogout}>
              Sign out
            </button>
          </div>

          <section className="account-panel">
            {tab === 'bookings' ? <AccountBookingsList /> : <AccountProfileForm key={user.id} />}
          </section>
        </div>
      </div>
    </div>
  );
}
