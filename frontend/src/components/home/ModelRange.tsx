import Image from 'next/image';
import Link from 'next/link';
import type { CarListItem } from '@/lib/api';
import { getLineupCarImage } from '@/lib/lineup-assets';

type ModelRangeProps = {
  cars: CarListItem[];
};

export function ModelRange({ cars }: ModelRangeProps) {
  if (cars.length === 0) return null;

  return (
    <section className="model-range">
      <div className="container-suzuki">
        <ul className="model-range__grid">
          {cars.map((car) => (
            <li key={car.id} className="model-range__item">
              <Link href={`/catalog/${car.slug}`} className="model-range__link">
                <span className="model-range__image">
                  <Image
                    src={getLineupCarImage(car.slug, car.images)}
                    alt={car.name}
                    width={310}
                    height={174}
                    sizes="310px"
                    className="mx-auto h-auto w-full max-w-[310px]"
                  />
                </span>
                <span className="model-range__title">{car.name.toUpperCase()}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
