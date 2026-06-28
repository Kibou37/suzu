import { ModelRange } from '@/components/home/ModelRange';
import { NewsSection } from '@/components/home/NewsSection';
import { OwnersSection } from '@/components/home/OwnersSection';
import { PromoSlider } from '@/components/home/PromoSlider';
import { getCars } from '@/lib/api';
import { getCarImageUrl } from '@/lib/car-images';

const promoSlides = [
  {
    id: 'warranty-1',
    eyebrow: 'Warranty Service',
    title: 'at official dealers',
    description: 'Current manufacturer warranty obligations.',
    href: '/service',
    imageUrl:
      'https://img.perxis.ru/unsafe/2200x0/prxs/originals/cnpdfranifss73cb3u9g/original',
  },
  {
    id: 'warranty-2',
    eyebrow: 'Warranty Service',
    title: 'at official dealers',
    description: 'Current manufacturer warranty obligations.',
    href: '/service',
    imageUrl:
      'https://img.perxis.ru/unsafe/2200x0/prxs/originals/cnpdgj2nifss73cb3udg/original',
  },
  {
    id: 'warranty-3',
    eyebrow: 'Warranty Service',
    title: 'at official dealers',
    description: 'Current manufacturer warranty obligations.',
    href: '/service',
    imageUrl:
      'https://img.perxis.ru/unsafe/1660x0/prxs/originals/cnpdfranifss73cb3ua0/original',
  },
] as const;

export default async function HomePage() {
  const cars = await getCars({ condition: 'NEW' });
  const featured = cars.filter((car) => car.isFeatured);
  const lineup = featured.length > 0 ? featured : cars.slice(0, 4);

  const slidesWithImages = promoSlides.map((slide, index) => {
    const car = lineup[index];
    return {
      ...slide,
      imageUrl: car ? getCarImageUrl(car.images, car.name) : slide.imageUrl,
    };
  });

  return (
    <div>
      <PromoSlider slides={slidesWithImages} />
      <ModelRange cars={lineup} />
      <OwnersSection />
      <NewsSection />
    </div>
  );
}
