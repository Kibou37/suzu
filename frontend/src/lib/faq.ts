import { DEMO_FAQ_ENTRIES } from '@/data/demo-content';
import { apiUrl, isDemoDataMode } from '@/lib/config';

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  sortOrder: number;
};

export async function getFaqEntries(): Promise<FaqEntry[]> {
  if (isDemoDataMode()) {
    return [...DEMO_FAQ_ENTRIES].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const res = await fetch(apiUrl('/api/faq'), { next: { revalidate: 300 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}
