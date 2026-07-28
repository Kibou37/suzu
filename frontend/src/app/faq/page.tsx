import { PageHeader } from '@/components/ui/PageShell';
import { FaqAccordion } from '@/components/content/FaqAccordion';
import { getFaqEntries } from '@/lib/faq';
import { safeJsonLdStringify } from '@/lib/json-ld';

export const metadata = { title: 'FAQ' };

export default async function FaqPage() {
  const entries = await getFaqEntries();

  const faqJsonLd =
    entries.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: entries.map((entry) => ({
            '@type': 'Question',
            name: entry.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: entry.answer,
            },
          })),
        }
      : null;

  return (
    <div className="page-shell">
      <div className="container-suzuki">
        <PageHeader
          title="Frequently Asked Questions"
          description="Answers to common questions about buying, financing and servicing your Suzuki."
          breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'FAQ' }]}
        />

        {faqJsonLd ? (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(faqJsonLd) }}
          />
        ) : null}

        {entries.length === 0 ? (
          <div className="placeholder-box">No questions published yet — please check back soon.</div>
        ) : (
          <FaqAccordion entries={entries} />
        )}
      </div>
    </div>
  );
}
