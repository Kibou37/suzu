'use client';

import Link from 'next/link';
import { useState } from 'react';
import { dealer } from '@suzuki/shared';
import { getRecaptchaToken, isRecaptchaEnabled } from '@/lib/recaptcha';
import { submitContact } from '@/lib/contact';

export function ContactForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') ?? '').trim();
    const email = String(form.get('email') ?? '').trim().toLowerCase();
    const phone = String(form.get('phone') ?? '').trim();
    const message = String(form.get('message') ?? '').trim();

    if (name.length < 2) {
      setError('Please enter your name.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (message.length < 10) {
      setError('Please enter a longer message.');
      return;
    }

    setSubmitting(true);
    const formEl = event.currentTarget;

    try {
      const recaptchaToken = isRecaptchaEnabled()
        ? await getRecaptchaToken('contact_form')
        : undefined;

      await submitContact({
        name,
        email,
        phone: phone || undefined,
        message,
        recaptchaToken,
      });

      const { trackEvent } = await import('@/lib/analytics');
      trackEvent('generate_lead', { lead_type: 'contact' });

      setSuccess('Thank you. Your message has been sent. We will reply shortly.');
      formEl.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to send message.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form__field">
        <label htmlFor="contact-name">Full name *</label>
        <input id="contact-name" name="name" required minLength={2} />
      </div>
      <div className="contact-form__field">
        <label htmlFor="contact-email">Email *</label>
        <input id="contact-email" type="email" name="email" required />
      </div>
      <div className="contact-form__field">
        <label htmlFor="contact-phone">Phone</label>
        <input id="contact-phone" name="phone" />
      </div>
      <div className="contact-form__field">
        <label htmlFor="contact-message">Message *</label>
        <textarea id="contact-message" name="message" rows={6} required minLength={10} />
      </div>

      {error && <p className="contact-form__error">{error}</p>}
      {success && <p className="contact-form__success">{success}</p>}

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Sending…' : 'Send message'}
      </button>

      <p className="contact-form__aside">
        Prefer a map view?{' '}
        <Link href="/dealers" className="link-action">
          Find {dealer.name} and other dealers
        </Link>
      </p>
    </form>
  );
}
