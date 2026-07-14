'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AccountLkShell } from '@/components/account/AccountLkShell';
import { AccountPhoneField, buildFullPhone } from '@/components/account/AccountPhoneField';
import { useAuth } from '@/context/AuthProvider';
import { DEMO_TEST_ACCOUNT } from '@/lib/demo-test-account';

type LoginMethod = 'phone' | 'email';

export function AccountLoginForm() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [method, setMethod] = useState<LoginMethod>('phone');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/account');
    }
  }, [loading, user, router]);

  if (loading || user) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '').trim();

    const loginValue =
      method === 'phone'
        ? buildFullPhone(
            String(form.get('phoneCountry') ?? '+44'),
            String(form.get('phone') ?? ''),
          )
        : String(form.get('email') ?? '').trim().toLowerCase();

    if (!loginValue) {
      setError(method === 'phone' ? 'Please enter your phone number.' : 'Please enter your email.');
      setSubmitting(false);
      return;
    }

    try {
      await login({ login: loginValue, password });
      router.push('/account');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccountLkShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'My Account', href: '/account/login' },
        { label: 'Sign in' },
      ]}
      info={
        <div className="account-lk__intro">
          <h1 className="account-lk__title">
            <span className="account-lk__welcome-mark">&gt;</span>
            スズキへようこそ!
            <span className="account-lk__welcome-note">*</span>
          </h1>
          <p className="account-lk__lead">
            Your Suzuki account gives you access to service offers, online test drive and
            maintenance booking, plus everything useful about your Suzuki.
          </p>
          <p className="account-lk__footnote">*Welcome to Suzuki!</p>
        </div>
      }
    >
      <h2 className="account-lk__title">Authorisation</h2>

      <form className="account-lk__form" onSubmit={handleSubmit}>
        {method === 'phone' ? (
          <>
            <AccountPhoneField
              required
              hint="When pasting a number, omit the country code. For example, enter 555 444 33 22 instead of +44 555 444 33 22."
            />
            <button
              type="button"
              className="account-lk__switch"
              onClick={() => setMethod('email')}
            >
              Sign in with email instead
            </button>
          </>
        ) : (
          <>
            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="login-email">
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                name="email"
                className="account-lk__input"
                autoComplete="email"
                required
              />
            </div>
            <button
              type="button"
              className="account-lk__switch"
              onClick={() => setMethod('phone')}
            >
              Sign in with phone instead
            </button>
          </>
        )}

        <div className="account-lk__field account-lk__field--full">
          <label className="account-lk__label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            type="password"
            name="password"
            className="account-lk__input"
            autoComplete="current-password"
            required
          />
        </div>

        {error && <p className="account-lk__error">{error}</p>}

        <div className="account-lk__actions">
          <button type="submit" className="btn btn-primary account-lk__submit" disabled={submitting}>
            {submitting ? 'Please wait…' : 'Sign in'}
          </button>
        </div>
      </form>

      <div className="account-lk__links account-lk__links--form">
        <p>
          Don&apos;t have an account?{' '}
          <Link href="/account/register" className="account-lk__link">
            Register here
          </Link>
        </p>
        <p>
          Forgot your password?{' '}
          <Link href="/account/login" className="account-lk__link account-lk__link--muted">
            Password recovery coming soon
          </Link>
        </p>
        {process.env.NEXT_PUBLIC_USE_DEMO_DATA === 'true' && (
          <p className="account-lk__demo-hint">
            <strong>Demo account:</strong> {DEMO_TEST_ACCOUNT.email} / {DEMO_TEST_ACCOUNT.password}
          </p>
        )}
      </div>
    </AccountLkShell>
  );
}
