type GtagEventParams = Record<string, string | number | boolean | undefined | null>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function getGaMeasurementId(): string | undefined {
  const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
  return id || undefined;
}

export function trackEvent(name: string, params?: GtagEventParams): void {
  if (typeof window === 'undefined') return;
  if (!getGaMeasurementId()) return;
  if (typeof window.gtag !== 'function') return;

  window.gtag('event', name, params ?? {});
}
