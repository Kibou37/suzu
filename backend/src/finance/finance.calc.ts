export type FinanceProduct = 'credit' | 'leasing';

export type FinanceRates = {
  creditAnnualRatePercent: number;
  leasingAnnualRatePercent: number;
  minDownPaymentPercent: number;
  maxTermMonths: number;
  minTermMonths: number;
  currency: string;
  disclaimer: string;
};

export type FinanceQuoteInput = {
  product: FinanceProduct;
  price: number;
  downPayment: number;
  termMonths: number;
  annualRatePercent?: number;
};

export type FinanceScheduleRow = {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
};

export type FinanceQuoteResult = {
  product: FinanceProduct;
  price: number;
  downPayment: number;
  financedAmount: number;
  termMonths: number;
  annualRatePercent: number;
  monthlyPayment: number;
  totalPayment: number;
  overpayment: number;
  schedule: FinanceScheduleRow[];
};

export const DEFAULT_FINANCE_RATES: FinanceRates = {
  creditAnnualRatePercent: 12.9,
  leasingAnnualRatePercent: 9.5,
  minDownPaymentPercent: 10,
  maxTermMonths: 84,
  minTermMonths: 12,
  currency: 'USD',
  disclaimer:
    'Indicative estimate only. Final terms depend on credit check and partner bank/lessor offers.',
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function annuityPayment(
  principal: number,
  annualRatePercent: number,
  termMonths: number,
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  const monthlyRate = annualRatePercent / 100 / 12;
  if (monthlyRate === 0) return round2(principal / termMonths);
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return round2((principal * monthlyRate * factor) / (factor - 1));
}

export function buildFinanceQuote(
  input: FinanceQuoteInput,
  rates: FinanceRates = DEFAULT_FINANCE_RATES,
): FinanceQuoteResult {
  const price = Math.max(0, Number(input.price) || 0);
  const downPayment = Math.min(
    price,
    Math.max(0, Number(input.downPayment) || 0),
  );
  const termMonths = Math.min(
    rates.maxTermMonths,
    Math.max(
      rates.minTermMonths,
      Math.round(Number(input.termMonths) || rates.minTermMonths),
    ),
  );
  const annualRatePercent =
    input.annualRatePercent ??
    (input.product === 'leasing'
      ? rates.leasingAnnualRatePercent
      : rates.creditAnnualRatePercent);

  const financedAmount = round2(price - downPayment);
  const monthlyPayment = annuityPayment(
    financedAmount,
    annualRatePercent,
    termMonths,
  );
  const schedule: FinanceScheduleRow[] = [];
  let balance = financedAmount;
  const monthlyRate = annualRatePercent / 100 / 12;

  for (let month = 1; month <= termMonths; month += 1) {
    const interest = round2(balance * monthlyRate);
    let principal = round2(monthlyPayment - interest);
    if (month === termMonths) {
      principal = round2(balance);
    }
    balance = round2(Math.max(0, balance - principal));
    schedule.push({
      month,
      payment:
        month === termMonths ? round2(principal + interest) : monthlyPayment,
      principal,
      interest,
      balance,
    });
  }

  const totalPayment = round2(
    schedule.reduce((sum, row) => sum + row.payment, 0) + downPayment,
  );
  const overpayment = round2(totalPayment - price);

  return {
    product: input.product,
    price,
    downPayment,
    financedAmount,
    termMonths,
    annualRatePercent,
    monthlyPayment,
    totalPayment,
    overpayment,
    schedule,
  };
}
