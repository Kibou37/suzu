'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { useAdminAuth } from '@/components/admin/AdminAuthContext';
import { AdminAlert } from '@/components/admin/AdminUi';

export function AdminLoginForm() {
  const router = useRouter();
  const { login } = useAdminAuth();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(loginValue, password);
      router.replace('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__brand">
          <p className="admin-login__brand-kicker">Suzuki</p>
          <h1 className="admin-login__brand-title">Admin sign in</h1>
        </div>

        <form onSubmit={handleSubmit} className="account-lk__form">
          <label className="account-lk__field account-lk__field--full">
            <span className="account-lk__label">Email or username</span>
            <input
              type="text"
              value={loginValue}
              onChange={(event) => setLoginValue(event.target.value)}
              autoComplete="username"
              required
              className="account-lk__input"
            />
          </label>

          <label className="account-lk__field account-lk__field--full">
            <span className="account-lk__label">Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
              className="account-lk__input"
            />
          </label>

          {error && <AdminAlert message={error} />}

          <div className="account-lk__actions">
            <button type="submit" disabled={isSubmitting} className="btn btn-primary account-lk__submit">
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
