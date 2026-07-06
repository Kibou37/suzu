import { isRecaptchaEnabled } from '@/lib/recaptcha';

export function ConversionFormRecaptchaNotice() {
  if (!isRecaptchaEnabled()) {
    return null;
  }

  return (
    <p className="conversion-form__recaptcha">
      This site is protected by reCAPTCHA and the Google{' '}
      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
        Privacy Policy
      </a>{' '}
      and{' '}
      <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer">
        Terms of Service
      </a>{' '}
      apply.
    </p>
  );
}
