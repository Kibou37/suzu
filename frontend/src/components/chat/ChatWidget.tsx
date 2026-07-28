'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { sendChatMessage, type ChatHistoryItem } from '@/lib/chat';
import { trackEvent } from '@/lib/analytics';
import { withBasePath } from '@/lib/base-path';

const DEFAULT_QUICK = [
  'Which SUVs do you have?',
  'Book a test drive',
  'Estimate finance for $25,000',
  'Service hours and address',
  'Contact a manager',
];

type UiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

/** Match site paths with or without a leading slash; display without slash. */
const SITE_PATH_RE =
  /(?<![\w/])\/?(?:catalog(?:\/[\w-]+)?|finance(?:\?[\w=&%]*)?|test-drive|service|dealers|contacts|faq|configurator|blog(?:\/[\w-]+)?)(?![\w-])/gi;

function linkify(text: string) {
  const parts: Array<string | { href: string; label: string }> = [];
  let lastIndex = 0;
  const matches = text.matchAll(SITE_PATH_RE);

  for (const match of matches) {
    const raw = match[0];
    const start = match.index ?? 0;
    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    const href = raw.startsWith('/') ? raw : `/${raw}`;
    const label = raw.startsWith('/') ? raw.slice(1) : raw;
    parts.push({ href, label });
    lastIndex = start + raw.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 0) {
    return [<span key="plain">{text}</span>];
  }

  return parts.map((part, index) => {
    if (typeof part === 'string') {
      return <span key={`t-${index}`}>{part}</span>;
    }
    return (
      <Link key={`l-${index}-${part.href}`} href={part.href} className="chat-widget__link">
        {part.label}
      </Link>
    );
  });
}

export function ChatWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_QUICK);
  const [messages, setMessages] = useState<UiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Hi — I'm your Suzuki dealer AI agent. I can check inventory, estimate finance in USD, help with test drives and service, and connect you to a manager.",
    },
  ]);
  const listRef = useRef<HTMLDivElement>(null);

  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');

  useEffect(() => {
    if (!open) return;
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open, busy]);

  if (isAdmin) {
    return null;
  }

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setError(null);
    setInput('');
    const userMessage: UiMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages((current) => [...current, userMessage]);
    setBusy(true);

    const history: ChatHistoryItem[] = [...messages, userMessage]
      .filter((item) => item.id !== 'welcome')
      .map((item) => ({ role: item.role, content: item.content }));

    try {
      const reply = await sendChatMessage(trimmed, history.slice(0, -1));
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          content: reply.reply,
        },
      ]);
      if (reply.suggestions?.length) {
        setSuggestions(reply.suggestions);
      }
      trackEvent('chat_message', {
        chat_source: reply.source,
        tools: (reply.toolsUsed ?? []).join(','),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach the assistant.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`chat-widget${open ? ' is-open' : ''}`}>
      {open && (
        <div className="chat-widget__panel" role="dialog" aria-label="Suzuki AI agent">
          <div className="chat-widget__header">
            <div>
              <p className="chat-widget__title">Suzuki AI agent</p>
              <p className="chat-widget__subtitle">Inventory · finance · bookings</p>
            </div>
            <button
              type="button"
              className="chat-widget__icon-btn"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="chat-widget__messages" ref={listRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chat-widget__bubble chat-widget__bubble--${message.role}`}
              >
                {linkify(message.content)}
              </div>
            ))}
            {busy && (
              <div className="chat-widget__bubble chat-widget__bubble--assistant chat-widget__typing">
                Agent is thinking…
              </div>
            )}
          </div>

          <div className="chat-widget__quick">
            {suggestions.map((item) => (
              <button
                key={item}
                type="button"
                className="chat-widget__chip"
                disabled={busy}
                onClick={() => void send(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <form
            className="chat-widget__form"
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask the agent…"
              aria-label="Chat message"
              disabled={busy}
            />
            <button type="submit" className="btn btn-primary" disabled={busy || !input.trim()}>
              Send
            </button>
          </form>
          {error && <p className="chat-widget__error">{error}</p>}
        </div>
      )}

      <button
        type="button"
        className="chat-widget__launcher"
        aria-expanded={open}
        aria-label={open ? 'Close chat' : 'Open chat'}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) trackEvent('chat_open');
        }}
      >
        {open ? (
          <span className="chat-widget__launcher-close" aria-hidden>
            ×
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element -- static public icon
          <img
            src={withBasePath('/icons/chat.png')}
            alt=""
            width={28}
            height={28}
            className="chat-widget__launcher-icon"
          />
        )}
      </button>
    </div>
  );
}
