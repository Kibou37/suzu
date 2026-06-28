import { notFound } from 'next/navigation';
import { CarDetailContent } from '@/components/catalog/CarDetailContent';
import { getCar, getCars } from '@/lib/api';

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const cars = await getCars();
  return cars.map((car) => ({ slug: car.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const car = await getCar(slug);
  return { title: car?.name ?? 'Vehicle' };
}

export default async function CarDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const car = await getCar(slug);

  if (!car) {
    notFound();
  }

  return <CarDetailContent car={car} />;
}
