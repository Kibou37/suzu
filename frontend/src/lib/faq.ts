import { apiUrl, isDemoDataMode } from '@/lib/config';

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
};

export async function getFaqEntries(): Promise<FaqEntry[]> {
  if (isDemoDataMode()) return [];

  try {
    const res = await fetch(apiUrl('/api/faq'), { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
