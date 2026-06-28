'use client';

import { useState } from 'react';

const STORAGE_KEY = 'suzuki-cookie-consent';

function hasCookieConsent(): boolean {
  if (typeof window === 'undefined') {
    return true;
  }

  return Boolean(localStorage.getItem(STORAGE_KEY));
}

export function CookieBanner() {
  const [visible, setVisible] = useState(() => !hasCookieConsent());

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-suzuki-border bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
      <div className="container-suzuki flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-3xl text-xs leading-relaxed text-suzuki-muted sm:text-sm">
          By using this site, you agree to our{' '}
          <a href="/contacts" className="text-suzuki-blue underline">
            privacy policy
          </a>{' '}
          and the use of cookies. You can disable cookies in your browser settings.
        </p>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(STORAGE_KEY, '1');
            setVisible(false);
          }}
          className="btn btn-primary shrink-0 self-start sm:self-center"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
