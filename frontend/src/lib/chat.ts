import { apiUrl, isDemoDataMode, parseApiError } from '@/lib/config';

export type ChatHistoryItem = {
  role: 'user' | 'assistant';
  content: string;
};

export type ChatReply = {
  reply: string;
  source: 'agent' | 'faq' | 'fallback' | 'escalation' | 'openai';
  toolsUsed?: string[];
  suggestions?: string[];
};

const DEMO_REPLIES: Record<string, string> = {
  'which suvs do you have?':
    'Demo mode: open catalog for Vitara, Jimny and more SUVs.',
  'book a test drive': 'Demo mode: book at test-drive.',
  'estimate finance for $25,000':
    'Demo mode: try finance?price=25000 for a USD estimate.',
  'service hours and address': 'Demo mode: dealer details are on dealers.',
  'contact a manager': 'Demo mode: leave a message at contacts.',
};

export async function sendChatMessage(
  message: string,
  history: ChatHistoryItem[] = [],
): Promise<ChatReply> {
  if (isDemoDataMode()) {
    const key = message.trim().toLowerCase();
    return {
      reply:
        DEMO_REPLIES[key] ??
        'Demo mode assistant: browse catalog, finance, test-drive, service and contacts.',
      source: 'fallback',
      suggestions: Object.keys(DEMO_REPLIES).map(
        (item) => item.charAt(0).toUpperCase() + item.slice(1),
      ),
    };
  }

  const res = await fetch(apiUrl('/api/chat'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(parseApiError(text, 'Chat is temporarily unavailable'));
  }

  return res.json();
}
