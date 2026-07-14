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
} as const;

export function isDemoDataMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_DEMO_DATA === 'true';
}

export function getApiBaseUrl(): string {
  if (typeof window === 'undefined') {
    return (
      process.env.API_INTERNAL_URL ??
      process.env.NEXT_PUBLIC_API_URL ??
      'http://localhost:4000'
    );
  }

  return process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';
}

export function parseApiError(raw: string, fallback: string): string {
  try {
    const parsed = JSON.parse(raw) as { message?: string | string[] };
    const msg = parsed.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join('. ');
  } catch {
    // not JSON — likely HTML or plain text in dev mode
  }
  return fallback;
}
