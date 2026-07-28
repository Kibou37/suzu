import { authHeaders } from '@/lib/auth';
import { apiUrl, isDemoDataMode, parseApiError, STORAGE_KEYS } from '@/lib/config';

export type QuoteContactMethod = 'PHONE' | 'EMAIL' | 'EITHER';

export type QuoteRequestPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  carSlug: string;
  modelName: string;
  summary: string;
  totalPrice: number;
  snapshot?: Record<string, unknown>;
  configurationId?: string;
  dealerId: string;
  dealerName: string;
  contactMethod: QuoteContactMethod;
  recaptchaToken?: string;
};

export type QuoteRequestResult = {
  id: string;
  status: string;
  createdAt: string;
};

export async function submitQuoteRequest(
  payload: QuoteRequestPayload,
): Promise<QuoteRequestResult> {
  if (isDemoDataMode()) {
    const sessionId = localStorage.getItem(STORAGE_KEYS.demoSession);
    const id = `demo-quote-${Date.now()}`;
    const result: QuoteRequestResult = {
      id,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    if (typeof window !== 'undefined' && sessionId) {
      try {
        const raw = localStorage.getItem('suzuki-demo-quote-requests');
        const all = raw ? (JSON.parse(raw) as Record<string, unknown[]>) : {};
        const items = all[sessionId] ?? [];
        all[sessionId] = [{ ...payload, ...result }, ...items];
        localStorage.setItem('suzuki-demo-quote-requests', JSON.stringify(all));
      } catch {
        // ignore demo storage errors
      }
    }

    return result;
  }

  const res = await fetch(apiUrl('/api/quotes'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Unable to submit quote request'));
  }

  return res.json();
}
