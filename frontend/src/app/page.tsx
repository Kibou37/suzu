import { ModelRange } from '@/components/home/ModelRange';
import { NewsSection } from '@/components/home/NewsSection';
import { OwnersSection } from '@/components/home/OwnersSection';
import { PromoSlider } from '@/components/home/PromoSlider';
import { getCars } from '@/lib/api';
import type { CarListItem } from '@/lib/api';
import { getBlogPosts } from '@/lib/blog';
import { getHomePromoSlides } from '@/lib/home-banners';

const HOME_LINEUP_SLUGS = ['vitara', 'jimny', 'swift', 's-cross'] as const;
const HOME_NEWS_LIMIT = 3;

function pickHomeLineup(cars: CarListItem[]): CarListItem[] {
  return HOME_LINEUP_SLUGS.flatMap((slug) => {
    const car = cars.find((item) => item.slug === slug);
    return car ? [car] : [];
  });
}

export default async function HomePage() {
  const [cars, slides, blogPosts] = await Promise.all([
    getCars({ condition: 'NEW' }),
    getHomePromoSlides(),
    getBlogPosts(),
  ]);
  const lineup = pickHomeLineup(cars);
  const news = blogPosts.slice(0, HOME_NEWS_LIMIT);

  return (
    <div>
      {slides.length > 0 ? <PromoSlider slides={slides} /> : null}
      <ModelRange cars={lineup} />
      <OwnersSection />
      <NewsSection posts={news} />
    </div>
  );
}
