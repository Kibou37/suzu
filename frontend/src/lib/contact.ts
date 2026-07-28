import { apiUrl, isDemoDataMode, parseApiError } from '@/lib/config';

export type ContactPayload = {
  name: string;
  email: string;
  phone?: string;
  message: string;
  recaptchaToken?: string;
};

export async function submitContact(payload: ContactPayload): Promise<void> {
  if (isDemoDataMode()) return;

  const res = await fetch(apiUrl('/api/contact'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Unable to send message'));
  }
}
