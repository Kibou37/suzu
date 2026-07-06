'use client';

import Script from 'next/script';

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export function RecaptchaScript() {
  if (!SITE_KEY) {
    return null;
  }

  return (
    <Script
      src={`https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`}
      strategy="lazyOnload"
    />
  );
}
