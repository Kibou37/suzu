import { FinanceCalculator } from '@/components/finance/FinanceCalculator';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';

export const metadata = { title: 'Finance calculator' };

/** Static export (GitHub Pages): query string is applied client-side only. */
export const dynamic = 'force-static';

type FinancePageProps = {
  searchParams?: Promise<{ price?: string; model?: string }>;
};

export default async function FinancePage({ searchParams }: FinancePageProps) {
  const params = searchParams ? await searchParams : {};
  const price = Number(params.price);
  const initialPrice = Number.isFinite(price) && price > 0 ? price : 22000;

  return (
    <div className="finance-page">
      <div className="finance-page__hero">
        <div className="container-suzuki">
          <Breadcrumbs
            items={[{ label: 'Home', href: '/' }, { label: 'Finance' }]}
          />
          <p className="finance-page__eyebrow">Suzuki finance</p>
          <h1 className="finance-page__title">Finance calculator</h1>
          <p className="finance-page__lead">
            Plan credit or leasing payments, then request a tailored offer from the dealer.
          </p>
        </div>
      </div>

      <div className="container-suzuki finance-page__body">
        <FinanceCalculator initialPrice={initialPrice} carSlug={params.model} />
      </div>
    </div>
  );
}
