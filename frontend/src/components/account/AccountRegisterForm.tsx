'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { dealers } from '@suzuki/shared';
import { AccountLkShell } from '@/components/account/AccountLkShell';
import { AccountPhoneField, buildFullPhone } from '@/components/account/AccountPhoneField';
import { useAuth } from '@/context/AuthProvider';
import type { VehicleIdentifierType } from '@/lib/auth';
import { sendSmsCode, verifySmsCode } from '@/lib/auth';
import { isValidVin } from '@/lib/bookings';

const PASSWORD_RULES = [
  'At least 8 characters.',
  'Must contain at least one digit.',
  'Cannot consist of digits only.',
];

type RegisterMethod = 'phone' | 'email';
type RegisterStep = 1 | 'sms' | 2 | 3;

type Step1Data = {
  method: RegisterMethod;
  email?: string;
  phone?: string;
  phoneCountry: string;
  phoneLocal: string;
  password: string;
};

type Step2Data = {
  firstName: string;
  lastName: string;
};

function isValidChassisNumber(value: string): boolean {
  return /^[A-Z0-9-]{5,20}$/i.test(value.trim());
}

function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must contain at least 8 characters.';
  if (/^\d+$/.test(password)) return 'Password cannot consist of digits only.';
  if (!/\d/.test(password)) return 'Password must contain at least one digit.';
  return null;
}

type ParseStep1Result =
  | { ok: true; data: Step1Data }
  | { ok: false; error: string };

function parseStep1Form(form: FormData, method: RegisterMethod): ParseStep1Result {
  const password = String(form.get('password') ?? '').trim();
  const passwordConfirm = String(form.get('passwordConfirm') ?? '').trim();
  const acceptTerms = form.get('acceptTerms') === 'on';
  const acceptPrivacy = form.get('acceptPrivacy') === 'on';

  const passwordError = validatePassword(password);
  if (passwordError) {
    return { ok: false, error: passwordError };
  }

  if (password !== passwordConfirm) {
    return { ok: false, error: 'Passwords do not match.' };
  }

  if (!acceptTerms || !acceptPrivacy) {
    return { ok: false, error: 'Please accept the terms and privacy consent to continue.' };
  }

  const phoneCountry = String(form.get('phoneCountry') ?? '+44');
  const phoneLocal = String(form.get('phone') ?? '').trim();
  const email = method === 'email' ? String(form.get('email') ?? '').trim().toLowerCase() : undefined;
  const phone = method === 'phone' ? buildFullPhone(phoneCountry, phoneLocal) : undefined;

  if (method === 'email' && !email) {
    return { ok: false, error: 'Please enter your email address.' };
  }

  if (method === 'phone' && !phone) {
    return { ok: false, error: 'Please enter your phone number.' };
  }

  return {
    ok: true,
    data: {
      method,
      email,
      phone,
      phoneCountry,
      phoneLocal,
      password,
    },
  };
}

export function AccountRegisterForm() {
  const { register, user, loading } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState<RegisterStep>(1);
  const [method, setMethod] = useState<RegisterMethod>('phone');
  const [identifierType, setIdentifierType] = useState<VehicleIdentifierType>('VIN');
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [smsHint, setSmsHint] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/account');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = window.setTimeout(() => setResendIn((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendIn]);

  if (loading || user) {
    return null;
  }

  const handleStep1Submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSmsHint(null);

    const result = parseStep1Form(new FormData(event.currentTarget), method);
    if (!result.ok) {
      setError(result.error);
      return;
    }

    setStep1Data(result.data);

    if (result.data.method === 'phone' && result.data.phone) {
      setSubmitting(true);
      try {
        const response = await sendSmsCode(result.data.phone);
        setResendIn(60);
        if (response.devCode) {
          setSmsHint(`Dev code: ${response.devCode}`);
        }
        setStep('sms');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to send SMS code.');
      } finally {
        setSubmitting(false);
      }
      return;
    }

    setStep(2);
  };

  const handleSmsSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!step1Data?.phone) {
      setStep(1);
      return;
    }

    const form = new FormData(event.currentTarget);
    const code = String(form.get('smsCode') ?? '').trim();
    if (!/^\d{6}$/.test(code)) {
      setError('Enter the 6-digit code from the SMS.');
      return;
    }

    setSubmitting(true);
    try {
      await verifySmsCode(step1Data.phone, code);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid verification code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendSms = async () => {
    if (!step1Data?.phone || resendIn > 0) return;
    setError(null);
    setSubmitting(true);
    try {
      const response = await sendSmsCode(step1Data.phone);
      setResendIn(60);
      if (response.devCode) {
        setSmsHint(`Dev code: ${response.devCode}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to resend SMS code.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStep2Submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!step1Data) {
      setStep(1);
      return;
    }

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get('firstName') ?? '').trim();
    const lastName = String(form.get('lastName') ?? '').trim();

    if (!firstName) {
      setError('Please enter your first name.');
      return;
    }

    if (!lastName) {
      setError('Please enter your last name.');
      return;
    }

    setStep2Data({ firstName, lastName });
    setStep(3);
  };

  const handleStep3Submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!step1Data || !step2Data) {
      setStep(step1Data ? 2 : 1);
      return;
    }

    const form = new FormData(event.currentTarget);
    const vehicleIdentifier = String(form.get('vehicleIdentifier') ?? '').trim().toUpperCase();
    const dealerId = String(form.get('dealerId') ?? '').trim();
    const selectedDealer = dealers.find((item) => item.id === dealerId);

    if (!vehicleIdentifier) {
      setError('Please enter your VIN or chassis number.');
      return;
    }

    if (identifierType === 'VIN' && !isValidVin(vehicleIdentifier)) {
      setError('VIN must contain 17 valid characters.');
      return;
    }

    if (identifierType === 'CHASSIS' && !isValidChassisNumber(vehicleIdentifier)) {
      setError('Chassis number must be 5–20 characters.');
      return;
    }

    if (!selectedDealer) {
      setError('Please select your dealer.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        email: step1Data.email,
        phone: step1Data.phone,
        password: step1Data.password,
        firstName: step2Data.firstName,
        lastName: step2Data.lastName,
        vehicleIdentifierType: identifierType,
        vehicleIdentifier,
        dealerId: selectedDealer.id,
        dealerName: selectedDealer.name,
      });
      router.push('/account');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  const loginPreview =
    step1Data?.method === 'email'
      ? step1Data.email
      : step1Data?.phone;

  const infoPanel =
    step === 1 ? (
      <div className="account-lk__rules">
        <p className="account-lk__rules-title">Password requirements:</p>
        <ul className="account-lk__rules-list">
          {PASSWORD_RULES.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </div>
    ) : step === 'sms' ? (
      <p className="account-lk__lead">
        Enter the 6-digit code we sent by SMS to confirm your phone number.
      </p>
    ) : step === 2 ? (
      <p className="account-lk__lead">
        Tell us your name so we can personalise your account and booking experience.
      </p>
    ) : (
      <p className="account-lk__lead">
        Add your Suzuki vehicle and preferred dealer to unlock service history and
        personalised offers in your account.
      </p>
    );

  const stepLabel =
    step === 1
      ? 'Step 1 of 4'
      : step === 'sms'
        ? 'Step 2 of 4'
        : step === 2
          ? method === 'phone'
            ? 'Step 3 of 4'
            : 'Step 2 of 3'
          : method === 'phone'
            ? 'Step 4 of 4'
            : 'Step 3 of 3';

  return (
    <AccountLkShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'My Account', href: '/account/login' },
        { label: 'Register' },
      ]}
      info={
        <>
          <div className="account-lk__intro account-lk__intro--register">
            <h1 className="account-lk__title">It&apos;s simple and convenient!</h1>
            <p className="account-lk__lead">
              Register for a Suzuki account and get the most out of your Suzuki ownership
              experience.
            </p>
          </div>
          {infoPanel}
        </>
      }
    >
      <p className="account-lk__step">{stepLabel}</p>

      {step === 1 && (
        <>
          <h2 className="account-lk__title">Step 1: Account details</h2>
          <blockquote className="account-lk__quote">
            Your mobile phone number or email address will be used as your login.
          </blockquote>
          <form className="account-lk__form" onSubmit={handleStep1Submit}>
            {method === 'phone' ? (
              <>
                <AccountPhoneField
                  required
                  defaultCountry={step1Data?.phoneCountry}
                  defaultPhone={step1Data?.phoneLocal}
                  hint="We will send an SMS verification code to this number."
                />
                <button type="button" className="account-lk__switch" onClick={() => setMethod('email')}>
                  Register with email instead
                </button>
              </>
            ) : (
              <>
                <div className="account-lk__field account-lk__field--full">
                  <label className="account-lk__label" htmlFor="register-email">
                    Email address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    name="email"
                    className="account-lk__input"
                    autoComplete="email"
                    defaultValue={step1Data?.email ?? ''}
                    required
                  />
                  <p className="account-lk__hint">
                    A confirmation email will be sent to this address when email verification is enabled.
                  </p>
                </div>
                <button type="button" className="account-lk__switch" onClick={() => setMethod('phone')}>
                  Register with phone instead
                </button>
              </>
            )}

            <hr className="account-lk__rule account-lk__rule--inner" />

            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="register-password">
                Password *
              </label>
              <input
                id="register-password"
                type="password"
                name="password"
                className="account-lk__input"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="register-password-confirm">
                Confirm password *
              </label>
              <input
                id="register-password-confirm"
                type="password"
                name="passwordConfirm"
                className="account-lk__input"
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <hr className="account-lk__rule account-lk__rule--inner" />

            <label className="account-lk__checkbox">
              <input type="checkbox" name="acceptTerms" required />
              <span>
                I accept the{' '}
                <Link href="/dealers" className="account-lk__link">
                  Account Terms of Use
                </Link>
                . *
              </span>
            </label>

            <label className="account-lk__checkbox">
              <input type="checkbox" name="acceptPrivacy" required />
              <span>I consent to the processing of my personal data. *</span>
            </label>

            {error && <p className="account-lk__error">{error}</p>}

            <div className="account-lk__actions">
              <button
                type="submit"
                className="btn btn-primary account-lk__submit"
                disabled={submitting}
              >
                {submitting
                  ? 'Please wait…'
                  : method === 'phone'
                    ? 'Send SMS code'
                    : 'Continue'}
              </button>
            </div>
          </form>
        </>
      )}

      {step === 'sms' && (
        <>
          <h2 className="account-lk__title">Verify your phone</h2>
          <blockquote className="account-lk__quote">
            Code sent to {step1Data?.phone}
          </blockquote>
          <form className="account-lk__form" onSubmit={handleSmsSubmit}>
            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="register-sms-code">
                SMS code *
              </label>
              <input
                id="register-sms-code"
                type="text"
                name="smsCode"
                className="account-lk__input"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                pattern="\d{6}"
                required
              />
              {smsHint ? <p className="account-lk__hint">{smsHint}</p> : null}
            </div>

            {error && <p className="account-lk__error">{error}</p>}

            <div className="account-lk__actions account-lk__actions--split">
              <button
                type="button"
                className="btn btn-secondary account-lk__submit"
                onClick={() => {
                  setError(null);
                  setStep(1);
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-secondary account-lk__submit"
                disabled={submitting || resendIn > 0}
                onClick={() => void handleResendSms()}
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
              </button>
              <button type="submit" className="btn btn-primary account-lk__submit" disabled={submitting}>
                {submitting ? 'Please wait…' : 'Verify'}
              </button>
            </div>
          </form>
        </>
      )}

      {step === 2 && (
        <>
          <h2 className="account-lk__title">Personal details</h2>
          <blockquote className="account-lk__quote">
            {loginPreview ? `Your login: ${loginPreview}` : 'Please enter your name to continue.'}
          </blockquote>
          <form className="account-lk__form" onSubmit={handleStep2Submit}>
            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="register-first-name">
                First name *
              </label>
              <input
                id="register-first-name"
                type="text"
                name="firstName"
                className="account-lk__input"
                autoComplete="given-name"
                defaultValue={step2Data?.firstName ?? ''}
                required
              />
            </div>

            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="register-last-name">
                Last name *
              </label>
              <input
                id="register-last-name"
                type="text"
                name="lastName"
                className="account-lk__input"
                autoComplete="family-name"
                defaultValue={step2Data?.lastName ?? ''}
                required
              />
            </div>

            {error && <p className="account-lk__error">{error}</p>}

            <div className="account-lk__actions account-lk__actions--split">
              <button
                type="button"
                className="btn btn-secondary account-lk__submit"
                onClick={() => {
                  setError(null);
                  setStep(step1Data?.method === 'phone' ? 'sms' : 1);
                }}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary account-lk__submit">
                Continue
              </button>
            </div>
          </form>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="account-lk__title">Your vehicle</h2>
          <blockquote className="account-lk__quote">
            Enter your VIN or chassis number and choose the dealer where you purchased or
            service your Suzuki.
          </blockquote>
          <form className="account-lk__form" onSubmit={handleStep3Submit}>
            <fieldset className="account-lk__field account-lk__field--full">
              <legend className="account-lk__label">Identifier type *</legend>
              <div className="account-lk__radio-row">
                <label className="account-lk__radio">
                  <input
                    type="radio"
                    name="identifierType"
                    value="VIN"
                    checked={identifierType === 'VIN'}
                    onChange={() => setIdentifierType('VIN')}
                  />
                  <span>VIN</span>
                </label>
                <label className="account-lk__radio">
                  <input
                    type="radio"
                    name="identifierType"
                    value="CHASSIS"
                    checked={identifierType === 'CHASSIS'}
                    onChange={() => setIdentifierType('CHASSIS')}
                  />
                  <span>Chassis number</span>
                </label>
              </div>
            </fieldset>

            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="register-vehicle-id">
                {identifierType === 'VIN' ? 'VIN *' : 'Chassis number *'}
              </label>
              <input
                id="register-vehicle-id"
                type="text"
                name="vehicleIdentifier"
                className="account-lk__input"
                placeholder={identifierType === 'VIN' ? '17-character VIN' : 'Chassis number'}
                maxLength={identifierType === 'VIN' ? 17 : 20}
                autoCapitalize="characters"
                spellCheck={false}
                required
              />
            </div>

            <div className="account-lk__field account-lk__field--full">
              <label className="account-lk__label" htmlFor="register-dealer">
                Dealer *
              </label>
              <select id="register-dealer" name="dealerId" className="account-lk__select" required defaultValue="">
                <option value="" disabled>
                  Select a dealer
                </option>
                {dealers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} — {item.address}
                  </option>
                ))}
              </select>
            </div>

            {error && <p className="account-lk__error">{error}</p>}

            <div className="account-lk__actions account-lk__actions--split">
              <button
                type="button"
                className="btn btn-secondary account-lk__submit"
                onClick={() => {
                  setError(null);
                  setStep(2);
                }}
                disabled={submitting}
              >
                Back
              </button>
              <button type="submit" className="btn btn-primary account-lk__submit" disabled={submitting}>
                {submitting ? 'Please wait…' : 'Create account'}
              </button>
            </div>
          </form>
        </>
      )}

      <p className="account-lk__links account-lk__links--form">
        Already have an account?{' '}
        <Link href="/account/login" className="account-lk__link">
          Sign in
        </Link>
      </p>
    </AccountLkShell>
  );
}
