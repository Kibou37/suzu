'use client';

import Link from 'next/link';
import { useState } from 'react';
import { AccountLkShell } from '@/components/account/AccountLkShell';
import { forgotPassword } from '@/lib/auth';

export function ForgotPasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    const email = String(new FormData(event.currentTarget).get('email') ?? '')
      .trim()
      .toLowerCase();

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      setSubmitting(false);
      return;
    }

    try {
      await forgotPassword(email);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to start recovery.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccountLkShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'My Account', href: '/account/login' },
        { label: 'Forgot password' },
      ]}
      info={
        <div className="account-lk__intro">
          <h1 className="account-lk__title">Reset your password</h1>
          <p className="account-lk__lead">
            Enter the email linked to your account. If it exists, we will send a reset link.
          </p>
        </div>
      }
    >
      {done ? (
        <div className="account-lk__form">
          <p className="account-lk__lead">
            If an account exists for that email, a reset link has been sent. Check your inbox
            (and spam folder).
          </p>
          <div className="account-lk__links account-lk__links--form">
            <Link href="/account/login" className="account-lk__link">
              Back to sign in
            </Link>
          </div>
        </div>
      ) : (
        <form className="account-lk__form" onSubmit={handleSubmit}>
          <div className="account-lk__field account-lk__field--full">
            <label className="account-lk__label" htmlFor="forgot-email">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              name="email"
              className="account-lk__input"
              autoComplete="email"
              required
            />
          </div>

          {error && <p className="account-lk__error">{error}</p>}

          <div className="account-lk__actions">
            <button type="submit" className="btn btn-primary account-lk__submit" disabled={submitting}>
              {submitting ? 'Please wait…' : 'Send reset link'}
            </button>
          </div>

          <div className="account-lk__links account-lk__links--form">
            <Link href="/account/login" className="account-lk__link">
              Back to sign in
            </Link>
          </div>
        </form>
      )}
    </AccountLkShell>
  );
}
