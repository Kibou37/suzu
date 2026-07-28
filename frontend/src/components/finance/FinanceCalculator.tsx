'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  buildFinanceQuote,
  DEFAULT_FINANCE_RATES,
  type FinanceProduct,
  type FinanceRates,
} from '@/lib/finance';
import { apiUrl, isDemoDataMode } from '@/lib/config';
import { trackEvent } from '@/lib/analytics';
import { formatPrice } from '@/lib/format';

type FinanceCalculatorProps = {
  initialPrice?: number;
  carSlug?: string;
  carName?: string;
  compact?: boolean;
};

function normalizeRates(data: Partial<FinanceRates>): FinanceRates {
  const currency = (data.currency ?? DEFAULT_FINANCE_RATES.currency).toUpperCase();
  return {
    ...DEFAULT_FINANCE_RATES,
    ...data,
    // USA site: never display GBP even if a stale API still returns it
    currency: currency === 'GBP' ? 'USD' : currency || 'USD',
  };
}

export function FinanceCalculator({
  initialPrice = 20000,
  carSlug,
  carName,
  compact = false,
}: FinanceCalculatorProps) {
  const [rates, setRates] = useState<FinanceRates>(DEFAULT_FINANCE_RATES);
  const [product, setProduct] = useState<FinanceProduct>('credit');
  const [price, setPrice] = useState(initialPrice);
  const [downPayment, setDownPayment] = useState(
    Math.round(initialPrice * (DEFAULT_FINANCE_RATES.minDownPaymentPercent / 100)),
  );
  const [termMonths, setTermMonths] = useState(48);
  const [showSchedule, setShowSchedule] = useState(false);

  useEffect(() => {
    setPrice(initialPrice);
    setDownPayment(Math.round(initialPrice * (rates.minDownPaymentPercent / 100)));
  }, [initialPrice, rates.minDownPaymentPercent]);

  useEffect(() => {
    if (isDemoDataMode()) return;

    void (async () => {
      try {
        const res = await fetch(apiUrl('/api/finance/rates'), { cache: 'no-store' });
        if (!res.ok) return;
        const data = (await res.json()) as FinanceRates;
        setRates(normalizeRates(data));
      } catch {
        /* keep defaults */
      }
    })();
  }, []);

  const quote = useMemo(
    () =>
      buildFinanceQuote(
        {
          product,
          price,
          downPayment,
          termMonths,
        },
        rates,
      ),
    [product, price, downPayment, termMonths, rates],
  );

  const depositPercent =
    price > 0 ? Math.round((downPayment / price) * 100) : rates.minDownPaymentPercent;

  const contactHref = `/contacts?topic=finance${carSlug ? `&model=${encodeURIComponent(carSlug)}` : ''}`;

  return (
    <div className={`finance-calc${compact ? ' finance-calc--compact' : ''}`}>
      <div className="finance-calc__shell">
        <div className="finance-calc__controls">
          {!compact && (
            <div className="finance-calc__intro">
              <p className="finance-calc__eyebrow">Estimate</p>
              <h2 className="finance-calc__title">
                {carName ? `Suzuki ${carName}` : 'Monthly payment'}
              </h2>
              <p className="finance-calc__lead">
                Adjust price, deposit and term. Figures are indicative — request a dealer offer for
                final terms.
              </p>
            </div>
          )}

          <div className="finance-calc__tabs" role="tablist" aria-label="Finance product">
            {(['credit', 'leasing'] as const).map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={product === item}
                className={`finance-calc__tab${product === item ? ' is-active' : ''}`}
                onClick={() => setProduct(item)}
              >
                {item === 'credit' ? 'Credit' : 'Leasing'}
              </button>
            ))}
          </div>

          <div className="finance-calc__fields">
            <label className="finance-calc__field">
              <span className="finance-calc__field-top">
                <span>Vehicle price</span>
                <strong>{formatPrice(price)}</strong>
              </span>
              <input
                type="range"
                min={5000}
                max={Math.max(80000, Math.ceil(initialPrice * 1.5))}
                step={500}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value) || 0)}
              />
              <input
                className="finance-calc__number"
                type="number"
                min={0}
                step={100}
                value={price}
                onChange={(event) => setPrice(Number(event.target.value) || 0)}
                aria-label="Vehicle price amount"
              />
            </label>

            <label className="finance-calc__field">
              <span className="finance-calc__field-top">
                <span>Deposit · {depositPercent}%</span>
                <strong>{formatPrice(downPayment)}</strong>
              </span>
              <input
                type="range"
                min={0}
                max={price || 1}
                step={100}
                value={Math.min(downPayment, price)}
                onChange={(event) => setDownPayment(Number(event.target.value) || 0)}
              />
              <p className="finance-calc__hint">
                Recommended from {rates.minDownPaymentPercent}%
              </p>
            </label>

            <label className="finance-calc__field">
              <span className="finance-calc__field-top">
                <span>Term</span>
                <strong>
                  {termMonths} months · {(termMonths / 12).toFixed(termMonths % 12 === 0 ? 0 : 1)} yr
                </strong>
              </span>
              <input
                type="range"
                min={rates.minTermMonths}
                max={rates.maxTermMonths}
                step={6}
                value={termMonths}
                onChange={(event) => setTermMonths(Number(event.target.value))}
              />
            </label>
          </div>
        </div>

        <aside className="finance-calc__result" aria-live="polite">
          <p className="finance-calc__result-label">Estimated monthly</p>
          <p className="finance-calc__value">
            {formatPrice(quote.monthlyPayment)}
          </p>
          <p className="finance-calc__result-note">
            {product === 'credit' ? 'Credit' : 'Leasing'} · {quote.annualRatePercent.toFixed(1)}% APR
          </p>

          <dl className="finance-calc__stats">
            <div>
              <dt>Financed</dt>
              <dd>{formatPrice(quote.financedAmount)}</dd>
            </div>
            <div>
              <dt>Total payable</dt>
              <dd>{formatPrice(quote.totalPayment)}</dd>
            </div>
            <div>
              <dt>Overpayment</dt>
              <dd>{formatPrice(quote.overpayment)}</dd>
            </div>
          </dl>

          <div className="finance-calc__actions">
            <Link
              href={contactHref}
              className="btn btn-primary finance-calc__cta"
              onClick={() =>
                trackEvent('generate_lead', {
                  lead_type: 'finance_cta',
                  finance_product: product,
                  car_slug: carSlug,
                })
              }
            >
              Request finance offer
            </Link>
            <button
              type="button"
              className="finance-calc__schedule-toggle"
              onClick={() => setShowSchedule((value) => !value)}
            >
              {showSchedule ? 'Hide schedule' : 'Payment schedule'}
            </button>
          </div>
        </aside>
      </div>

      {showSchedule && (
        <div className="finance-calc__schedule-wrap">
          <table className="finance-calc__schedule">
            <thead>
              <tr>
                <th>#</th>
                <th>Payment</th>
                <th>Principal</th>
                <th>Interest</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {quote.schedule.map((row) => (
                <tr key={row.month}>
                  <td>{row.month}</td>
                  <td>{formatPrice(row.payment)}</td>
                  <td>{formatPrice(row.principal)}</td>
                  <td>{formatPrice(row.interest)}</td>
                  <td>{formatPrice(row.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="finance-calc__disclaimer">{rates.disclaimer}</p>
    </div>
  );
}
