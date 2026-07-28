'use client';

import { useMemo, useState } from 'react';
import type { FaqEntry } from '@/lib/faq';

type FaqAccordionProps = {
  entries: FaqEntry[];
};

export function FaqAccordion({ entries }: FaqAccordionProps) {
  const [query, setQuery] = useState('');

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? entries.filter(
          (entry) =>
            entry.question.toLowerCase().includes(q) ||
            entry.answer.toLowerCase().includes(q) ||
            (entry.category ?? '').toLowerCase().includes(q),
        )
      : entries;

    const map = new Map<string, FaqEntry[]>();
    for (const entry of filtered) {
      const key = entry.category?.trim() || 'General';
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [entries, query]);

  return (
    <div className="faq-page">
      <label className="faq-page__search">
        <span className="sr-only">Search FAQ</span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search questions…"
          className="faq-page__search-input"
        />
      </label>

      {groups.length === 0 ? (
        <div className="placeholder-box">No matching questions.</div>
      ) : (
        <div className="faq-page__groups">
          {groups.map(([category, items]) => (
            <section key={category}>
              <h2 className="faq-page__category">{category}</h2>
              <div className="faq-page__list">
                {items.map((item) => (
                  <details key={item.id} className="faq-page__item">
                    <summary>{item.question}</summary>
                    <p>{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
