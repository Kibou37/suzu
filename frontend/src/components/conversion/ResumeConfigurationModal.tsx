'use client';

import { useEffect, useId, useRef } from 'react';
import { formatPrice } from '@/lib/format';
import type { SavedConfiguration } from '@/lib/configurations';

type ResumeConfigurationModalProps = {
  open: boolean;
  configuration: SavedConfiguration;
  onContinue: () => void;
  onStartNew: () => void;
};

function buildPreviewLines(configuration: SavedConfiguration): string[] {
  const snap = (configuration.snapshot ?? {}) as Record<string, unknown>;
  const lines = [
    `Suzuki ${configuration.modelName}${configuration.trim ? ` · ${configuration.trim}` : ''}`,
    typeof snap.bodyColorName === 'string' ? `Exterior: ${snap.bodyColorName}` : null,
    typeof snap.interiorColorName === 'string' ? `Interior: ${snap.interiorColorName}` : null,
  ];

  if (Array.isArray(snap.optionNames) && snap.optionNames.length > 0) {
    lines.push(
      `Options: ${(snap.optionNames as string[]).slice(0, 4).join(', ')}`,
    );
  }

  return lines.filter((line): line is string => Boolean(line));
}

export function ResumeConfigurationModal({
  open,
  configuration,
  onContinue,
  onStartNew,
}: ResumeConfigurationModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const preview = buildPreviewLines(configuration);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    window.setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLButtonElement>('button[data-primary]')
        ?.focus();
    }, 0);

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="quote-modal" role="presentation">
      <div
        ref={dialogRef}
        className="quote-modal__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="quote-modal__header">
          <div>
            <p className="quote-modal__eyebrow">Saved configuration</p>
            <h2 id={titleId} className="quote-modal__title">
              Continue where you left off?
            </h2>
          </div>
        </header>

        <div className="quote-modal__config">
          <p className="quote-modal__config-label">Last saved for this model</p>
          <pre className="quote-modal__config-summary">{preview.join('\n')}</pre>
          {configuration.totalPrice > 0 && (
            <p className="quote-modal__config-price">
              Estimated total: {formatPrice(configuration.totalPrice)}
            </p>
          )}
          <p className="quote-modal__config-meta">
            Updated {new Date(configuration.updatedAt).toLocaleString('en-GB')}
          </p>
        </div>

        <div className="quote-modal__body">
          <p className="quote-modal__hint">
            Open your latest saved configuration, or start a new one for this model.
          </p>
          <div className="quote-modal__actions">
            <button type="button" className="btn btn-secondary" onClick={onStartNew}>
              Start new
            </button>
            <button
              type="button"
              className="btn btn-primary"
              data-primary
              onClick={onContinue}
            >
              Open last save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
