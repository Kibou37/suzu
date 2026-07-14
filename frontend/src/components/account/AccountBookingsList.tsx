'use client';

import { useEffect, useState } from 'react';
import {
  bookingStatusLabel,
  bookingTypeLabel,
  fetchAccountBookings,
  type AccountBooking,
} from '@/lib/account';
import { formatBookingSlot } from '@/lib/bookings';

export function AccountBookingsList() {
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        const items = await fetchAccountBookings();
        setBookings(items);
      } catch {
        setError('Unable to load your bookings.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <p className="account-panel__empty">Loading bookings…</p>;
  }

  if (error) {
    return <p className="conversion-form__message conversion-form__message--error">{error}</p>;
  }

  if (bookings.length === 0) {
    return (
      <p className="account-panel__empty">
        You have no bookings yet. Book a test drive or service appointment to see them here.
      </p>
    );
  }

  return (
    <ul className="account-bookings">
      {bookings.map((booking) => (
        <li key={booking.id} className="account-bookings__item">
          <div className="account-bookings__head">
            <span className="account-bookings__type">{bookingTypeLabel(booking.type)}</span>
            <span className={`account-bookings__status account-bookings__status--${booking.status.toLowerCase()}`}>
              {bookingStatusLabel(booking.status)}
            </span>
          </div>
          <p className="account-bookings__date">{formatBookingSlot(booking.scheduledAt)}</p>
          {booking.carName && <p className="account-bookings__meta">Model: {booking.carName}</p>}
          {!booking.carName && booking.notes?.startsWith('Service:') && (
            <p className="account-bookings__meta">{booking.notes.split('\n')[0]}</p>
          )}
        </li>
      ))}
    </ul>
  );
}
