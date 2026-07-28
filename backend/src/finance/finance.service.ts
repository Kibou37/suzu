import { Injectable } from '@nestjs/common';
import {
  buildFinanceQuote,
  DEFAULT_FINANCE_RATES,
  type FinanceProduct,
  type FinanceQuoteResult,
  type FinanceRates,
} from './finance.calc';

@Injectable()
export class FinanceService {
  getRates(): FinanceRates {
    const credit = Number(process.env.FINANCE_CREDIT_RATE_PERCENT);
    const leasing = Number(process.env.FINANCE_LEASING_RATE_PERCENT);
    const minDown = Number(process.env.FINANCE_MIN_DOWN_PERCENT);
    // USA market default — ignore legacy GBP if env empty / stale
    const currencyRaw = process.env.FINANCE_CURRENCY?.trim().toUpperCase();
    const currency =
      currencyRaw && /^[A-Z]{3}$/.test(currencyRaw) && currencyRaw !== 'GBP'
        ? currencyRaw
        : 'USD';

    return {
      ...DEFAULT_FINANCE_RATES,
      creditAnnualRatePercent: Number.isFinite(credit)
        ? credit
        : DEFAULT_FINANCE_RATES.creditAnnualRatePercent,
      leasingAnnualRatePercent: Number.isFinite(leasing)
        ? leasing
        : DEFAULT_FINANCE_RATES.leasingAnnualRatePercent,
      minDownPaymentPercent: Number.isFinite(minDown)
        ? minDown
        : DEFAULT_FINANCE_RATES.minDownPaymentPercent,
      currency,
    };
  }

  quote(input: {
    product: FinanceProduct;
    price: number;
    downPayment: number;
    termMonths: number;
  }): FinanceQuoteResult {
    return buildFinanceQuote(input, this.getRates());
  }
}
