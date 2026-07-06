type Grecaptcha = {
  ready: (callback: () => void) => void;
  execute: (siteKey: string, options: { action: string }) => Promise<string>;
};

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function isRecaptchaEnabled(): boolean {
  return Boolean(SITE_KEY);
}

function waitForRecaptcha(): Promise<Grecaptcha> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('reCAPTCHA is only available in the browser'));
      return;
    }

    const startedAt = Date.now();
    const check = () => {
      if (window.grecaptcha) {
        resolve(window.grecaptcha);
        return;
      }

      if (Date.now() - startedAt > 10000) {
        reject(new Error('reCAPTCHA failed to load'));
        return;
      }

      window.setTimeout(check, 100);
    };

    check();
  });
}

export async function getRecaptchaToken(action: string): Promise<string> {
  if (!SITE_KEY) {
    throw new Error('reCAPTCHA site key is not configured');
  }

  const grecaptcha = await waitForRecaptcha();

  return new Promise((resolve, reject) => {
    grecaptcha.ready(() => {
      grecaptcha.execute(SITE_KEY, { action }).then(resolve).catch(reject);
    });
  });
}
