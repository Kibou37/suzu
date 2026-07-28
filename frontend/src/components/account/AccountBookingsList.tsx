'use client';

import { useEffect, useState } from 'react';
import {
  bookingStatusLabel,
  bookingTypeLabel,
  cancelAccountBooking,
  fetchAccountBookings,
  type AccountBooking,
} from '@/lib/account';
import { formatBookingSlot } from '@/lib/bookings';

export function AccountBookingsList() {
  const [bookings, setBookings] = useState<AccountBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

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

  const canCancel = (booking: AccountBooking): boolean => {
    if (booking.type !== 'TEST_DRIVE') return false;
    if (booking.status === 'CANCELLED' || booking.status === 'COMPLETED') return false;
    return new Date(booking.scheduledAt) > new Date();
  };

  const handleCancel = async (booking: AccountBooking) => {
    const confirmed = window.confirm(
      `Cancel your test drive on ${formatBookingSlot(booking.scheduledAt)}?`,
    );
    if (!confirmed) return;

    setCancellingId(booking.id);
    setError(null);

    try {
      const updated = await cancelAccountBooking(booking.id);
      setBookings((current) =>
        current.map((item) => (item.id === updated.id ? updated : item)),
      );
    } catch (cancelError) {
      setError(
        cancelError instanceof Error
          ? cancelError.message
          : 'Unable to cancel booking.',
      );
    } finally {
      setCancellingId(null);
    }
  };

  if (loading) {
    return <p className="account-panel__empty">Loading bookings…</p>;
  }

  if (error && bookings.length === 0) {
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
    <>
      {error && (
        <p className="conversion-form__message conversion-form__message--error">{error}</p>
      )}
      <ul className="account-bookings">
        {bookings.map((booking) => (
          <li key={booking.id} className="account-bookings__item">
            <div className="account-bookings__head">
              <span className="account-bookings__type">{bookingTypeLabel(booking.type)}</span>
              <span
                className={`account-bookings__status account-bookings__status--${booking.status.toLowerCase()}`}
              >
                {bookingStatusLabel(booking.status)}
              </span>
            </div>
            <p className="account-bookings__date">{formatBookingSlot(booking.scheduledAt)}</p>
            {booking.carName && (
              <p className="account-bookings__meta">Model: {booking.carName}</p>
            )}
            {!booking.carName && booking.notes?.startsWith('Service:') && (
              <p className="account-bookings__meta">{booking.notes.split('\n')[0]}</p>
            )}
            {canCancel(booking) && (
              <div className="account-bookings__actions">
                <button
                  type="button"
                  className="btn btn-secondary account-item__danger"
                  disabled={cancellingId === booking.id}
                  onClick={() => void handleCancel(booking)}
                >
                  {cancellingId === booking.id ? 'Cancelling…' : 'Cancel test drive'}
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
