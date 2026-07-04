'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { CarListItem } from '@/lib/api';
import {
  formatBookingSlot,
  formatSlotTime,
  getBookingSlots,
  submitTestDrive,
} from '@/lib/bookings';

type TestDriveFormProps = {
  cars: CarListItem[];
  initialModelSlug?: string;
};

function minBookingDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return date.toISOString().slice(0, 10);
}

export function TestDriveForm({ cars, initialModelSlug }: TestDriveFormProps) {
  const searchParams = useSearchParams();
  const modelSlug = initialModelSlug ?? searchParams.get('model') ?? undefined;

  const newCars = useMemo(
    () => cars.filter((car) => car.condition === 'NEW'),
    [cars],
  );

  const [carSlug, setCarSlug] = useState(modelSlug ?? newCars[0]?.slug ?? '');
  const [date, setDate] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleDateChange = async (nextDate: string) => {
    setDate(nextDate);
    setScheduledAt('');

    if (!nextDate) {
      setSlots([]);
      return;
    }

    setLoadingSlots(true);

    try {
      const items = await getBookingSlots(nextDate);
      setSlots(items);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const customerName = String(form.get('customerName') ?? '').trim();
    const customerPhone = String(form.get('customerPhone') ?? '').trim();
    const customerEmail = String(form.get('customerEmail') ?? '').trim();
    const notes = String(form.get('notes') ?? '').trim();

    if (!carSlug || !scheduledAt) {
      setError('Please choose a model, date and time.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await submitTestDrive({
        carSlug,
        scheduledAt,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        notes: notes || undefined,
      });

      setSuccess(
        `Thank you! Your test drive is booked for ${formatBookingSlot(result.scheduledAt)}. We will confirm by email.`,
      );
      setDate('');
      setScheduledAt('');
      setSlots([]);
      event.currentTarget.reset();
    } catch {
      setError('Unable to complete the booking. Please try again or call the dealer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="conversion-form" onSubmit={handleSubmit}>
      <div className="conversion-form__grid">
        <label className="conversion-form__field">
          <span className="conversion-form__label">Model</span>
          <select
            name="carSlug"
            className="conversion-form__select"
            value={carSlug}
            onChange={(event) => setCarSlug(event.target.value)}
            required
          >
            {newCars.map((car) => (
              <option key={car.id} value={car.slug}>
                Suzuki {car.name} {car.trim ? `· ${car.trim}` : ''}
              </option>
            ))}
          </select>
        </label>

        <label className="conversion-form__field">
          <span className="conversion-form__label">Preferred date</span>
          <input
            type="date"
            name="date"
            className="conversion-form__input"
            min={minBookingDate()}
            value={date}
            onChange={(event) => void handleDateChange(event.target.value)}
            required
          />
        </label>

        <label className="conversion-form__field">
          <span className="conversion-form__label">Time</span>
          <select
            name="scheduledAt"
            className="conversion-form__select"
            value={scheduledAt}
            onChange={(event) => setScheduledAt(event.target.value)}
            required
            disabled={!date || loadingSlots || slots.length === 0}
          >
            <option value="">
              {loadingSlots
                ? 'Loading times…'
                : !date
                  ? 'Select a date first'
                  : slots.length === 0
                    ? 'No slots available'
                    : 'Choose a time'}
            </option>
            {slots.map((slot) => (
              <option key={slot} value={slot}>
                {formatSlotTime(slot)}
              </option>
            ))}
          </select>
        </label>

        <label className="conversion-form__field">
          <span className="conversion-form__label">Full name</span>
          <input
            type="text"
            name="customerName"
            className="conversion-form__input"
            autoComplete="name"
            required
          />
        </label>

        <label className="conversion-form__field">
          <span className="conversion-form__label">Phone</span>
          <input
            type="tel"
            name="customerPhone"
            className="conversion-form__input"
            autoComplete="tel"
            required
          />
        </label>

        <label className="conversion-form__field">
          <span className="conversion-form__label">Email</span>
          <input
            type="email"
            name="customerEmail"
            className="conversion-form__input"
            autoComplete="email"
          />
        </label>

        <label className="conversion-form__field conversion-form__field--full">
          <span className="conversion-form__label">Notes (optional)</span>
          <textarea
            name="notes"
            className="conversion-form__textarea"
            rows={3}
            placeholder="Preferred contact method, questions about the model…"
          />
        </label>
      </div>

      {error && <p className="conversion-form__message conversion-form__message--error">{error}</p>}
      {success && (
        <p className="conversion-form__message conversion-form__message--success">{success}</p>
      )}

      <div className="conversion-form__actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Book test drive'}
        </button>
      </div>
    </form>
  );
}
