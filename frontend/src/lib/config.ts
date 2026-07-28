/** SHA-256 hash using the Web Crypto API (browser + Node 20+). */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const buffer = await crypto.subtle.digest('SHA-256', encoder.encode(password));
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export const STORAGE_KEYS = {
  authToken: 'suzuki-auth-token',
  demoUsers: 'suzuki-demo-users',
  demoSession: 'suzuki-demo-session',
  demoBookings: 'suzuki-demo-account-bookings',
  demoConfigurations: 'suzuki-demo-account-configurations',
  configuratorSessionPrefix: 'suzuki-configurator-session',
} as const;

export function isDemoDataMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_DEMO_DATA === 'true';
}

function resolveApiUrl(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

/** Base URL for API calls. Browser uses same-origin `/api` proxy (see next.config rewrites). */
export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return resolveApiUrl(
      process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_URL,
      'http://localhost:4000',
    );
  }

  if (process.env.NEXT_PUBLIC_BASE_PATH) {
    return resolveApiUrl(process.env.NEXT_PUBLIC_API_URL, 'http://localhost:4000');
  }

  return '';
}

export function apiUrl(path: string): string {
  const base = getApiBaseUrl();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return base ? `${base.replace(/\/$/, '')}${normalizedPath}` : normalizedPath;
}

export function parseApiError(raw: string, fallback: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('Cannot ')) {
    return 'API route is unavailable. Please refresh the page or restart the backend.';
  }

  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    const msg = parsed.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join('. ');
  } catch {
    if (trimmed.length > 0 && trimmed.length < 200) {
      return trimmed;
    }
  }
  return fallback;
}
