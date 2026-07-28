'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { AccountLkShell } from '@/components/account/AccountLkShell';
import { resetPassword } from '@/lib/auth';

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token')?.trim() ?? '';
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }

    const form = new FormData(event.currentTarget);
    const password = String(form.get('password') ?? '').trim();
    const passwordConfirm = String(form.get('passwordConfirm') ?? '').trim();

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      router.replace('/account/login?reset=1');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reset password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AccountLkShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'My Account', href: '/account/login' },
        { label: 'New password' },
      ]}
      info={
        <div className="account-lk__intro">
          <h1 className="account-lk__title">Choose a new password</h1>
          <p className="account-lk__lead">Use at least 8 characters with one digit.</p>
        </div>
      }
    >
      {!token ? (
        <div className="account-lk__form">
          <p className="account-lk__error">This reset link is invalid.</p>
          <Link href="/account/forgot-password" className="account-lk__link">
            Request a new link
          </Link>
        </div>
      ) : (
        <form className="account-lk__form" onSubmit={handleSubmit}>
          <div className="account-lk__field account-lk__field--full">
            <label className="account-lk__label" htmlFor="reset-password">
              New password
            </label>
            <input
              id="reset-password"
              type="password"
              name="password"
              className="account-lk__input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          <div className="account-lk__field account-lk__field--full">
            <label className="account-lk__label" htmlFor="reset-password-confirm">
              Confirm password
            </label>
            <input
              id="reset-password-confirm"
              type="password"
              name="passwordConfirm"
              className="account-lk__input"
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>

          {error && <p className="account-lk__error">{error}</p>}

          <div className="account-lk__actions">
            <button type="submit" className="btn btn-primary account-lk__submit" disabled={submitting}>
              {submitting ? 'Please wait…' : 'Update password'}
            </button>
          </div>
        </form>
      )}
    </AccountLkShell>
  );
}
