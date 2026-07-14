'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { updateProfile } from '@/lib/account';
import { isSyntheticEmail } from '@/lib/auth';

export function AccountProfileForm() {
  const { user, refreshUser } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!user) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    const form = new FormData(event.currentTarget);

    try {
      await updateProfile({
        firstName: String(form.get('firstName') ?? '').trim() || undefined,
        lastName: String(form.get('lastName') ?? '').trim() || undefined,
        phone: String(form.get('phone') ?? '').trim() || undefined,
      });
      await refreshUser();
      setSuccess('Profile updated.');
    } catch {
      setError('Unable to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="conversion-form account-profile" onSubmit={handleSubmit}>
      {!isSyntheticEmail(user.email) && (
        <label className="conversion-form__field">
          <span className="conversion-form__label">Email</span>
          <input type="email" className="conversion-form__input" value={user.email} disabled />
        </label>
      )}

      {isSyntheticEmail(user.email) && user.phone && (
        <label className="conversion-form__field">
          <span className="conversion-form__label">Login (phone)</span>
          <input type="tel" className="conversion-form__input" value={user.phone} disabled />
        </label>
      )}

      <label className="conversion-form__field">
        <span className="conversion-form__label">First name</span>
        <input
          type="text"
          name="firstName"
          className="conversion-form__input"
          defaultValue={user.firstName ?? ''}
          autoComplete="given-name"
        />
      </label>

      <label className="conversion-form__field">
        <span className="conversion-form__label">Last name</span>
        <input
          type="text"
          name="lastName"
          className="conversion-form__input"
          defaultValue={user.lastName ?? ''}
          autoComplete="family-name"
        />
      </label>

      <label className="conversion-form__field conversion-form__field--full">
        <span className="conversion-form__label">Phone</span>
        <input
          type="tel"
          name="phone"
          className="conversion-form__input"
          defaultValue={user.phone ?? ''}
          autoComplete="tel"
        />
      </label>

      {user.vehicleIdentifier && (
        <label className="conversion-form__field conversion-form__field--full">
          <span className="conversion-form__label">
            {user.vehicleIdentifierType === 'CHASSIS' ? 'Chassis number' : 'VIN'}
          </span>
          <input
            type="text"
            className="conversion-form__input"
            value={user.vehicleIdentifier}
            disabled
          />
        </label>
      )}

      {user.dealerName && (
        <label className="conversion-form__field conversion-form__field--full">
          <span className="conversion-form__label">Dealer</span>
          <input type="text" className="conversion-form__input" value={user.dealerName} disabled />
        </label>
      )}

      {error && <p className="conversion-form__message conversion-form__message--error">{error}</p>}
      {success && <p className="conversion-form__message conversion-form__message--success">{success}</p>}

      <div className="conversion-form__actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Saving…' : 'Save profile'}
        </button>
      </div>
    </form>
  );
}
