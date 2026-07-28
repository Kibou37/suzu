'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { dealers } from '@suzuki/shared';
import { ConversionFormRecaptchaNotice } from '@/components/conversion/ConversionFormRecaptchaNotice';
import { useAuth } from '@/context/AuthProvider';
import { isSyntheticEmail } from '@/lib/auth';
import { isValidPhone } from '@/lib/bookings';
import type { ConfiguratorSelections } from '@/lib/configurator-query';
import { formatConfiguratorSummary } from '@/lib/configurator-query';
import { formatPrice } from '@/lib/format';
import { getRecaptchaToken, isRecaptchaEnabled } from '@/lib/recaptcha';
import {
  submitQuoteRequest,
  type QuoteContactMethod,
} from '@/lib/quotes';

type QuoteRequestModalProps = {
  open: boolean;
  onClose: () => void;
  selections: ConfiguratorSelections;
  configurationId?: string | null;
};

const CONTACT_METHODS: Array<{ value: QuoteContactMethod; label: string }> = [
  { value: 'PHONE', label: 'Phone' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'EITHER', label: 'Phone or email' },
];

export function QuoteRequestModal({
  open,
  onClose,
  selections,
  configurationId,
}: QuoteRequestModalProps) {
  const { user } = useAuth();
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const summary = formatConfiguratorSummary(selections);
  const defaultName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const defaultEmail =
    user?.email && !isSyntheticEmail(user.email) ? user.email : '';
  const defaultPhone = user?.phone ?? '';
  const defaultDealerId = user?.dealerId ?? dealers[0]?.id ?? '';

  useEffect(() => {
    if (!open) return;

    setError(null);
    setSuccess(null);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLInputElement>('input:not([readonly]), select, textarea')
        ?.focus();
    }, 0);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const customerName = String(form.get('customerName') ?? '').trim();
    const customerPhone = String(form.get('customerPhone') ?? '').trim();
    const customerEmail = String(form.get('customerEmail') ?? '').trim();
    const notes = String(form.get('notes') ?? '').trim();
    const dealerId = String(form.get('dealerId') ?? '').trim();
    const contactMethod = String(form.get('contactMethod') ?? 'EITHER') as QuoteContactMethod;
    const selectedDealer = dealers.find((item) => item.id === dealerId);

    if (customerName.length < 2) {
      setError('Please enter your full name.');
      return;
    }

    if (!isValidPhone(customerPhone)) {
      setError('Please enter a valid phone number.');
      return;
    }

    if (!customerEmail || !customerEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!selectedDealer) {
      setError('Please select a preferred dealer.');
      return;
    }

    if (!CONTACT_METHODS.some((method) => method.value === contactMethod)) {
      setError('Please choose a preferred contact method.');
      return;
    }

    setSubmitting(true);

    try {
      const recaptchaToken = isRecaptchaEnabled()
        ? await getRecaptchaToken('quote_request')
        : undefined;

      await submitQuoteRequest({
        customerName,
        customerPhone,
        customerEmail,
        notes: notes || undefined,
        carSlug: selections.modelSlug,
        modelName: selections.modelName,
        summary,
        totalPrice: selections.totalPrice,
        snapshot: {
          modelName: selections.modelName,
          bodyColorName: selections.bodyColor?.name ?? null,
          interiorColorName: selections.interiorColor?.name ?? null,
          optionNames: selections.options.map((option) => option.name),
        },
        configurationId: configurationId ?? undefined,
        dealerId: selectedDealer.id,
        dealerName: selectedDealer.name,
        contactMethod,
        recaptchaToken,
      });

      setSuccess(
        'Thank you. Your quote request has been sent. A dealer will contact you shortly.',
      );
      const { trackEvent } = await import('@/lib/analytics');
      trackEvent('generate_lead', {
        lead_type: 'quote',
        car_slug: selections.modelSlug,
        value: selections.totalPrice,
      });
      formEl.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Unable to submit quote request.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="quote-modal" role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className="quote-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="quote-modal__header">
          <div>
            <p className="quote-modal__eyebrow">Quote request</p>
            <h2 id={titleId} className="quote-modal__title">
              Request a price offer
            </h2>
          </div>
          <button
            type="button"
            className="quote-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="quote-modal__config">
          <p className="quote-modal__config-label">Your configuration</p>
          <pre className="quote-modal__config-summary">{summary}</pre>
          {selections.totalPrice > 0 && (
            <p className="quote-modal__config-price">
              Estimated total: {formatPrice(selections.totalPrice)}
            </p>
          )}
        </div>

        {success ? (
          <div className="quote-modal__body">
            <p className="conversion-form__message conversion-form__message--success">
              {success}
            </p>
            <div className="quote-modal__actions">
              <button type="button" className="btn btn-primary" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        ) : (
          <form className="conversion-form quote-modal__form" onSubmit={handleSubmit}>
            <div className="conversion-form__grid">
              <div className="conversion-form__field conversion-form__field--full">
                <label className="conversion-form__label" htmlFor="quote-name">
                  Full name
                </label>
                <input
                  id="quote-name"
                  name="customerName"
                  className="conversion-form__input"
                  required
                  defaultValue={defaultName}
                  autoComplete="name"
                />
              </div>

              <div className="conversion-form__field">
                <label className="conversion-form__label" htmlFor="quote-phone">
                  Phone
                </label>
                <input
                  id="quote-phone"
                  name="customerPhone"
                  type="tel"
                  className="conversion-form__input"
                  required
                  defaultValue={defaultPhone}
                  autoComplete="tel"
                />
              </div>

              <div className="conversion-form__field">
                <label className="conversion-form__label" htmlFor="quote-email">
                  Email
                </label>
                <input
                  id="quote-email"
                  name="customerEmail"
                  type="email"
                  className="conversion-form__input"
                  required
                  defaultValue={defaultEmail}
                  autoComplete="email"
                />
              </div>

              <div className="conversion-form__field">
                <label className="conversion-form__label" htmlFor="quote-dealer">
                  Preferred dealer
                </label>
                <select
                  id="quote-dealer"
                  name="dealerId"
                  className="conversion-form__select"
                  required
                  defaultValue={defaultDealerId}
                >
                  {dealers.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="conversion-form__field">
                <label className="conversion-form__label" htmlFor="quote-contact">
                  Preferred contact method
                </label>
                <select
                  id="quote-contact"
                  name="contactMethod"
                  className="conversion-form__select"
                  required
                  defaultValue="EITHER"
                >
                  {CONTACT_METHODS.map((method) => (
                    <option key={method.value} value={method.value}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="conversion-form__field conversion-form__field--full">
                <label className="conversion-form__label" htmlFor="quote-notes">
                  Comment
                </label>
                <textarea
                  id="quote-notes"
                  name="notes"
                  className="conversion-form__textarea"
                  rows={3}
                  placeholder="Any questions or preferences for your offer"
                />
              </div>
            </div>

            {error && (
              <p className="conversion-form__message conversion-form__message--error">{error}</p>
            )}

            <ConversionFormRecaptchaNotice />

            <div className="quote-modal__actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Sending…' : 'Send quote request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
