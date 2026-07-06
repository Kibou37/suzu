'use client';

import { dealer } from '@suzuki/shared';
import { useState } from 'react';
import { BookingDateField } from '@/components/conversion/BookingDateField';
import { ConversionFormSection } from '@/components/conversion/ConversionFormSection';
import { SERVICE_VEHICLES, getServiceVehicleLabel } from '@/data/service-vehicles';
import { ConversionFormRecaptchaNotice } from '@/components/conversion/ConversionFormRecaptchaNotice';
import {
  SERVICE_TYPES,
  formatBookingSlot,
  formatSlotTime,
  getBookingSlots,
  isValidPhone,
  isValidVin,
  submitService,
} from '@/lib/bookings';
import { getRecaptchaToken, isRecaptchaEnabled } from '@/lib/recaptcha';

const OTHER_VEHICLE = '__other__';

export function ServiceForm() {
  const [vehicleId, setVehicleId] = useState('');
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
      const items = await getBookingSlots(nextDate, 'SERVICE');
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
    const serviceType = String(form.get('serviceType') ?? '').trim();
    const vin = String(form.get('vin') ?? '').trim().toUpperCase();
    const mileageRaw = String(form.get('mileage') ?? '').trim();
    const otherVehicle = String(form.get('otherVehicle') ?? '').trim();
    const notes = String(form.get('notes') ?? '').trim();
    const mileage = mileageRaw ? Number(mileageRaw) : undefined;

    if (!scheduledAt || !serviceType) {
      setError('Please choose a service type, date and time.');
      return;
    }

    if (!vehicleId) {
      setError('Please select your vehicle.');
      return;
    }

    const vehicleLabel =
      vehicleId === OTHER_VEHICLE
        ? otherVehicle
        : getServiceVehicleLabel(vehicleId);

    if (!vehicleLabel) {
      setError('Please select your vehicle or describe it under Other.');
      return;
    }

    if (!isValidPhone(customerPhone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (vin && !isValidVin(vin)) {
      setError('VIN must be 17 characters (letters and digits, no I, O or Q).');
      return;
    }

    if (mileage != null && (Number.isNaN(mileage) || mileage < 0)) {
      setError('Please enter a valid mileage.');
      return;
    }

    let recaptchaToken: string | undefined;

    if (isRecaptchaEnabled()) {
      try {
        recaptchaToken = await getRecaptchaToken('service_booking');
      } catch {
        setError('Security check failed. Please refresh the page and try again.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const result = await submitService({
        scheduledAt,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
        serviceType,
        vehicle: vehicleLabel,
        vin: vin || undefined,
        mileage: mileage != null && !Number.isNaN(mileage) ? mileage : undefined,
        notes: notes || undefined,
        recaptchaToken,
      });

      setSuccess(
        `Thank you! Your service appointment is booked for ${formatBookingSlot(result.scheduledAt)}. We will confirm by phone or email.`,
      );
      setDate('');
      setScheduledAt('');
      setSlots([]);
      setVehicleId('');
      event.currentTarget.reset();
    } catch {
      setError('Unable to complete the booking. Please try again or call the service centre.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="conversion-form conversion-form--sections" onSubmit={handleSubmit}>
      <ConversionFormSection title="Your vehicle">
        <label className="conversion-form__field conversion-form__field--full">
          <span className="conversion-form__label">Service type</span>
          <select name="serviceType" className="conversion-form__select" required defaultValue="">
            <option value="" disabled>
              Select service
            </option>
            {SERVICE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="conversion-form__field conversion-form__field--full">
          <span className="conversion-form__label">Your vehicle</span>
          <select
            name="vehicleId"
            className="conversion-form__select"
            value={vehicleId}
            onChange={(event) => setVehicleId(event.target.value)}
            required
          >
            <option value="" disabled>
              Select model and specification
            </option>
            {SERVICE_VEHICLES.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.label}
              </option>
            ))}
            <option value={OTHER_VEHICLE}>Other — specify below</option>
          </select>
        </label>

        {vehicleId === OTHER_VEHICLE && (
          <label className="conversion-form__field conversion-form__field--full">
            <span className="conversion-form__label">Vehicle description</span>
            <input
              type="text"
              name="otherVehicle"
              className="conversion-form__input"
              placeholder="e.g. Vitara 1.4 AT"
              required
            />
          </label>
        )}

        <label className="conversion-form__field">
          <span className="conversion-form__label">VIN (optional)</span>
          <input
            type="text"
            name="vin"
            className="conversion-form__input"
            placeholder="17-character VIN"
            maxLength={17}
            autoCapitalize="characters"
            spellCheck={false}
          />
        </label>

        <label className="conversion-form__field">
          <span className="conversion-form__label">Mileage, km</span>
          <input
            type="number"
            name="mileage"
            className="conversion-form__input"
            min={0}
            step={1}
            placeholder="Current odometer reading"
          />
        </label>
      </ConversionFormSection>

      <ConversionFormSection
        title="Dealer & appointment"
        subtitle={`${dealer.name} · ${dealer.address}`}
      >
        <label className="conversion-form__field">
          <span className="conversion-form__label">Preferred date</span>
          <BookingDateField key={date} value={date} onChange={(nextDate) => void handleDateChange(nextDate)} required />
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
      </ConversionFormSection>

      <ConversionFormSection title="Your details">
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

        <label className="conversion-form__field conversion-form__field--full">
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
            placeholder="Describe symptoms, preferred contact method…"
          />
        </label>
      </ConversionFormSection>

      {error && <p className="conversion-form__message conversion-form__message--error">{error}</p>}
      {success && (
        <p className="conversion-form__message conversion-form__message--success">{success}</p>
      )}

      <ConversionFormRecaptchaNotice />

      <div className="conversion-form__actions">
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Sending…' : 'Book service appointment'}
        </button>
      </div>
    </form>
  );
}
