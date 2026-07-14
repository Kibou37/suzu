'use client';

import { ConfiguratorStagePreview } from '@/components/conversion/ConfiguratorStagePreview';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState, type CSSProperties } from 'react';
import { dealer } from '@suzuki/shared';
import type { CarListItem } from '@/lib/api';
import {
  calculateConfiguratorTotal,
  getConfiguratorData,
  type ConfigColor,
  type ConfigOption,
} from '@/data/demo-configurator';
import { formatPrice } from '@/lib/format';
import { withBasePath } from '@/lib/base-path';
import {
  buildConfiguratorQuery,
  formatConfiguratorSummary,
} from '@/lib/configurator-query';

type ConfiguratorFormProps = {
  cars: CarListItem[];
  initialModelSlug?: string;
};

const STEPS = [
  { id: 1, label: 'Exterior' },
  { id: 2, label: 'Interior' },
  { id: 3, label: 'Options' },
  { id: 4, label: 'Summary' },
] as const;

function SwatchDot({ color }: { color: ConfigColor }) {
  if (color.hexSecondary && color.hex) {
    const gradientId = `swatch-grad-${color.id}`;
    return (
      <svg className="configurator-color__dot-svg" viewBox="0 0 40 40" aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color.hex} />
            <stop offset="50%" stopColor={color.hex} />
            <stop offset="50%" stopColor={color.hexSecondary} />
            <stop offset="100%" stopColor={color.hexSecondary} />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="20" fill={`url(#${gradientId})`} />
      </svg>
    );
  }

  return (
    <span
      className="configurator-color__dot"
      style={{ backgroundColor: color.hex ?? '#c8cdd2' }}
    />
  );
}

function twoToneBackground(hex: string, hexSecondary: string): string {
  return `linear-gradient(135deg, ${hex} 50%, ${hexSecondary} 50%)`;
}

function ColorSwatch({
  color,
  selected,
  onSelect,
}: {
  color: ConfigColor;
  selected: boolean;
  onSelect: () => void;
}) {
  const [swatchBroken, setSwatchBroken] = useState(false);
  const swatchSrc =
    color.swatch && !swatchBroken ? withBasePath(color.swatch) : undefined;

  return (
    <button
      type="button"
      className={`configurator-color${selected ? ' configurator-color--selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${color.name}${color.price > 0 ? `, +${formatPrice(color.price)}` : ', included'}`}
    >
      <span className="configurator-color__ring">
        {swatchSrc ? (
          <img
            src={swatchSrc}
            alt=""
            className="configurator-color__swatch-img"
            loading="lazy"
            onError={() => setSwatchBroken(true)}
          />
        ) : (
          <SwatchDot color={color} />
        )}
      </span>
      <span className="configurator-color__meta">
        <span className="configurator-color__name">{color.name}</span>
        <span className="configurator-color__price">
          {color.price > 0 ? `+${formatPrice(color.price)}` : 'Included'}
        </span>
      </span>
    </button>
  );
}

function OptionCard({
  option,
  checked,
  onToggle,
}: {
  option: ConfigOption;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <label className={`configurator-option${checked ? ' configurator-option--selected' : ''}`}>
      <input
        type="checkbox"
        className="configurator-option__input"
        checked={checked}
        onChange={onToggle}
      />
      <span className="configurator-option__indicator" aria-hidden="true">
        <svg viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M1 5.5L4.5 9L11 1.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span className="configurator-option__body">
        <span className="configurator-option__head">
          <span className="configurator-option__name">{option.name}</span>
          {option.category && (
            <span className="configurator-option__category">{option.category}</span>
          )}
        </span>
        {option.description && (
          <span className="configurator-option__desc">{option.description}</span>
        )}
      </span>
      <span className="configurator-option__price">
        {option.price > 0 ? `+${formatPrice(option.price)}` : 'Included'}
      </span>
    </label>
  );
}

function SelectionChip({ label, color }: { label: string; color?: ConfigColor }) {
  const [broken, setBroken] = useState(false);
  const swatchSrc =
    color?.swatch && !broken ? withBasePath(color.swatch) : undefined;

  const dotStyle: CSSProperties | undefined = color?.hexSecondary && color.hex
    ? { background: twoToneBackground(color.hex, color.hexSecondary) }
    : color?.hex
      ? { backgroundColor: color.hex }
      : undefined;

  return (
    <span className="configurator-chip">
      {color && (
        swatchSrc ? (
          <img
            src={swatchSrc}
            alt=""
            className="configurator-chip__swatch"
            aria-hidden="true"
            onError={() => setBroken(true)}
          />
        ) : dotStyle ? (
          <span className="configurator-chip__dot" style={dotStyle} aria-hidden="true" />
        ) : null
      )}
      {label}
    </span>
  );
}

export function ConfiguratorForm({ cars, initialModelSlug }: ConfiguratorFormProps) {
  const searchParams = useSearchParams();
  const modelSlug = initialModelSlug ?? searchParams.get('model') ?? undefined;

  const newCars = useMemo(
    () => cars.filter((car) => car.condition === 'NEW'),
    [cars],
  );

  const selected = modelSlug
    ? newCars.find((car) => car.slug === modelSlug)
    : undefined;

  const [step, setStep] = useState(1);
  const [bodyColorId, setBodyColorId] = useState('');
  const [interiorColorId, setInteriorColorId] = useState('');
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);

  const configData = getConfiguratorData(modelSlug ?? '');
  const basePrice = selected ? Number(selected.price) : 0;

  const bodyColor = configData.bodyColors.find((color) => color.id === bodyColorId);
  const interiorColor = configData.interiorColors.find((color) => color.id === interiorColorId);
  const selectedOptions = configData.options.filter((option) =>
    selectedOptionIds.includes(option.id),
  );

  const totalPrice = calculateConfiguratorTotal(
    basePrice,
    bodyColor,
    interiorColor,
    selectedOptions,
  );

  const toggleOption = (optionId: string) => {
    setSelectedOptionIds((current) =>
      current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId],
    );
  };

  const canProceed = (): boolean => {
    if (step === 1) return Boolean(bodyColorId);
    if (step === 2) return Boolean(interiorColorId);
    return true;
  };

  const goToStep = (targetStep: number) => {
    if (targetStep < step) {
      setStep(targetStep);
    }
  };

  if (!modelSlug || !selected) {
    return (
      <div className="configurator configurator--empty">
        <div className="configurator__empty">
          <p className="configurator__empty-eyebrow">Configurator</p>
          <h2 className="configurator__empty-title">Choose a model first</h2>
          <p className="configurator__empty-desc">
            Open a model page in the catalogue and tap Configure to build your Suzuki.
          </p>
          <Link href="/catalog" className="btn btn-primary">
            Browse catalogue
          </Link>
        </div>
      </div>
    );
  }

  const stepTitle = STEPS.find((item) => item.id === step)?.label ?? '';
  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  const selections = {
    modelSlug: selected.slug,
    modelName: selected.name,
    bodyColor,
    interiorColor,
    options: selectedOptions.map((o) => ({ id: o.id, name: o.name })),
    totalPrice,
  };

  const configQuery = buildConfiguratorQuery(selections);
  const configSummary = formatConfiguratorSummary(selections);
  const quoteMailto = `mailto:${dealer.email}?subject=${encodeURIComponent(`Quote request — Suzuki ${selected.name}`)}&body=${encodeURIComponent(configSummary)}`;

  return (
    <div className="configurator">
      <div className="configurator__shell">
        <section className="configurator__stage" aria-label="Vehicle preview">
          <div className="configurator__stage-bg" aria-hidden="true" />
          <div className="configurator__stage-grid" aria-hidden="true" />

          <header className="configurator__stage-header">
            <nav className="configurator__breadcrumb" aria-label="Breadcrumb">
              <Link href="/catalog">Catalogue</Link>
              <span aria-hidden="true">/</span>
              <Link href={`/catalog/${selected.slug}`}>Suzuki {selected.name}</Link>
              <span aria-hidden="true">/</span>
              <span>Configure</span>
            </nav>

            <div className="configurator__model">
              <h1 className="configurator__model-name">Suzuki {selected.name}</h1>
              {selected.trim && (
                <span className="configurator__model-trim">{selected.trim}</span>
              )}
            </div>
          </header>

          <div className="configurator__visual">
            <ConfiguratorStagePreview
              modelSlug={selected.slug}
              modelName={selected.name}
              step={step}
              bodyColor={bodyColor}
            />
          </div>

          <div className="configurator__stage-footer">
            {(bodyColor || interiorColor) && (
              <div className="configurator__chips" aria-label="Current selections">
                {bodyColor && (
                  <SelectionChip label={bodyColor.name} color={bodyColor} />
                )}
                {interiorColor && (
                  <SelectionChip label={`Interior: ${interiorColor.name}`} color={interiorColor} />
                )}
              </div>
            )}

            <aside className="configurator__price-card">
              <p className="configurator__price-label">Estimated total</p>
              <p className="configurator__price-value">
                {totalPrice > 0 ? formatPrice(totalPrice) : 'On request'}
              </p>
              <p className="configurator__price-note">
                Indicative price. Final offer from your dealer may vary.
              </p>
            </aside>
          </div>
        </section>

        <section className="configurator__controls" aria-label="Configuration options">
          <div className="configurator__progress" aria-hidden="true">
            <span className="configurator__progress-fill" style={{ width: `${progress}%` }} />
          </div>

          <nav className="configurator__tabs" aria-label="Configuration steps">
            {STEPS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`configurator__tab${step === item.id ? ' configurator__tab--active' : ''}${step > item.id ? ' configurator__tab--done' : ''}`}
                onClick={() => goToStep(item.id)}
                disabled={item.id > step}
                aria-current={step === item.id ? 'step' : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className={`configurator__section${step === 3 ? ' configurator__section--options' : ''}`}>
            <div className="configurator__section-inner" key={step}>
              <header className="configurator__section-head">
                <h2 className="configurator__section-title">{stepTitle}</h2>
                <p className="configurator__section-desc">
                  {step === 1 && 'Select an exterior colour for your Suzuki.'}
                  {step === 2 && 'Choose the interior finish that suits you.'}
                  {step === 3 && 'Add optional equipment and accessory packs.'}
                  {step === 4 && 'Review your configuration before booking a test drive.'}
                </p>
              </header>

              {step === 1 && (
                <div className="configurator__colors">
                  {configData.bodyColors.map((color) => (
                    <ColorSwatch
                      key={color.id}
                      color={color}
                      selected={bodyColorId === color.id}
                      onSelect={() => setBodyColorId(color.id)}
                    />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="configurator__colors">
                  {configData.interiorColors.map((color) => (
                    <ColorSwatch
                      key={color.id}
                      color={color}
                      selected={interiorColorId === color.id}
                      onSelect={() => setInteriorColorId(color.id)}
                    />
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="configurator__options-scroll">
                  <div className="configurator__options">
                    {configData.options.map((option) => (
                      <OptionCard
                        key={option.id}
                        option={option}
                        checked={selectedOptionIds.includes(option.id)}
                        onToggle={() => toggleOption(option.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {step === 4 && (
                <dl className="configurator__breakdown">
                  <div className="configurator__breakdown-row configurator__breakdown-row--base">
                    <dt>Suzuki {selected.name}</dt>
                    <dd>{basePrice > 0 ? formatPrice(basePrice) : 'On request'}</dd>
                  </div>
                  {bodyColor && (
                    <div className="configurator__breakdown-row">
                      <dt>
                        {bodyColor.swatch ? (
                          <img
                            src={withBasePath(bodyColor.swatch)}
                            alt=""
                            className="configurator__breakdown-swatch"
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className="configurator__breakdown-dot"
                            style={{ backgroundColor: bodyColor.hex ?? '#c8cdd2' }}
                            aria-hidden="true"
                          />
                        )}
                        Exterior · {bodyColor.name}
                      </dt>
                      <dd>{bodyColor.price > 0 ? `+${formatPrice(bodyColor.price)}` : 'Included'}</dd>
                    </div>
                  )}
                  {interiorColor && (
                    <div className="configurator__breakdown-row">
                      <dt>
                        {interiorColor.swatch ? (
                          <img
                            src={withBasePath(interiorColor.swatch)}
                            alt=""
                            className="configurator__breakdown-swatch"
                            aria-hidden="true"
                          />
                        ) : (
                          <span
                            className="configurator__breakdown-dot"
                            style={{ backgroundColor: interiorColor.hex ?? '#c8cdd2' }}
                            aria-hidden="true"
                          />
                        )}
                        Interior · {interiorColor.name}
                      </dt>
                      <dd>
                        {interiorColor.price > 0
                          ? `+${formatPrice(interiorColor.price)}`
                          : 'Included'}
                      </dd>
                    </div>
                  )}
                  {selectedOptions.map((option) => (
                    <div key={option.id} className="configurator__breakdown-row">
                      <dt>{option.name}</dt>
                      <dd>{option.price > 0 ? `+${formatPrice(option.price)}` : 'Included'}</dd>
                    </div>
                  ))}
                  <div className="configurator__breakdown-row configurator__breakdown-row--total">
                    <dt>Estimated total</dt>
                    <dd>{totalPrice > 0 ? formatPrice(totalPrice) : 'On request'}</dd>
                  </div>
                  <div className="configurator__summary-actions">
                    <a href={quoteMailto} className="configurator__btn configurator__btn--outline">
                      Request quote
                    </a>
                    <Link
                      href={`/test-drive?${configQuery}`}
                      className="configurator__btn configurator__btn--primary"
                    >
                      Book test drive
                    </Link>
                  </div>
                </dl>
              )}
            </div>
          </div>

          <footer className="configurator__footer">
            {step > 1 ? (
              <button
                type="button"
                className="configurator__btn configurator__btn--ghost"
                onClick={() => setStep(step - 1)}
              >
                Back
              </button>
            ) : (
              <Link
                href={`/catalog/${selected.slug}`}
                className="configurator__btn configurator__btn--ghost"
              >
                Back to model
              </Link>
            )}

            {step < 4 ? (
              <button
                type="button"
                className="configurator__btn configurator__btn--primary"
                disabled={!canProceed()}
                onClick={() => setStep(step + 1)}
              >
                Continue
              </button>
            ) : (
              <Link
                href={`/test-drive?${configQuery}`}
                className="configurator__btn configurator__btn--primary"
              >
                Book test drive
              </Link>
            )}
          </footer>
        </section>
      </div>

      {step < 4 ? (
        <div className="configurator__mobile-bar" aria-hidden={false}>
          <div className="configurator__mobile-bar-inner">
            <div>
              <p className="configurator__mobile-bar-label">Estimated total</p>
              <p className="configurator__mobile-bar-price">
                {totalPrice > 0 ? formatPrice(totalPrice) : 'On request'}
              </p>
            </div>
            <button
              type="button"
              className="configurator__btn configurator__btn--primary"
              disabled={!canProceed()}
              onClick={() => setStep(step + 1)}
            >
              Continue
            </button>
          </div>
        </div>
      ) : (
        <div className="configurator__mobile-bar configurator__mobile-bar--summary">
          <div className="configurator__mobile-bar-inner">
            <div>
              <p className="configurator__mobile-bar-label">Estimated total</p>
              <p className="configurator__mobile-bar-price">
                {totalPrice > 0 ? formatPrice(totalPrice) : 'On request'}
              </p>
            </div>
            <Link
              href={`/test-drive?${configQuery}`}
              className="configurator__btn configurator__btn--primary"
            >
              Book test drive
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
