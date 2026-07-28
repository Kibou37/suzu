import { notFound } from 'next/navigation';
import { CarDetailContent } from '@/components/catalog/CarDetailContent';
import { getCar, getCars } from '@/lib/api';
import { carJsonLd, safeJsonLdStringify } from '@/lib/json-ld';
import { absoluteUrl } from '@/lib/seo';

type PageProps = {
  params: Promise<{ slug: string }>;
};

/** Required for `output: 'export'` (GitHub Pages). */
export const dynamic = 'force-static';
export const dynamicParams = false;

export async function generateStaticParams() {
  const cars = await getCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const car = await getCar(slug);
  if (!car) return { title: 'Vehicle' };

  const description =
    car.description ?? `Suzuki ${car.name} — specifications, price and configuration.`;
  const url = absoluteUrl(`/catalog/${car.slug}`);
  const image = car.images?.[0];

  return {
    title: car.name,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: car.name,
      description,
      url,
      type: 'website',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: car.name,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const car = await getCar(slug);

  if (!car) {
    notFound();
  }

  const jsonLd = carJsonLd({
    name: car.name,
    slug: car.slug,
    description: car.description,
    price: car.price,
    year: car.year,
    images: car.images,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLdStringify(jsonLd) }}
      />
      <CarDetailContent car={car} />
    </>
  );
}
