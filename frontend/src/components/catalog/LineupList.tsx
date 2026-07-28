import Image from 'next/image';
import Link from 'next/link';
import type { CarListItem } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { getLineupCarImage } from '@/lib/lineup-assets';

type LineupListProps = {
  cars: CarListItem[];
};

function getPriceLabel(car: CarListItem): string {
  const price = Number(car.price);
  if (price > 0) {
    return formatPrice(car.price);
  }
  return 'Request price from dealer';
}

function getCarBadges(car: CarListItem): { label: string; tone: 'used' | 'offer' | 'trade' }[] {
  const badges: { label: string; tone: 'used' | 'offer' | 'trade' }[] = [];

  if (car.condition === 'USED') {
    badges.push({ label: 'Pre-owned', tone: 'used' });
  }

  if (car.isOffer && car.offerLabel) {
    const isTradeIn = /trade/i.test(car.offerLabel);
    badges.push({
      label: car.offerLabel,
      tone: isTradeIn ? 'trade' : 'offer',
    });
  } else if (car.isOffer) {
    badges.push({ label: 'Special offer', tone: 'offer' });
  }

  return badges;
}

export function LineupList({ cars }: LineupListProps) {
  if (cars.length === 0) {
    return <p className="placeholder-box">No vehicles found.</p>;
  }

  return (
    <ul className="catalog-grid">
      {cars.map((car) => {
        const badges = getCarBadges(car);

        return (
          <li key={car.id} className="catalog-grid__item">
            <Link href={`/catalog/${car.slug}`} className="catalog-grid__link">
              <div className="catalog-grid__image">
                {badges.length > 0 && (
                  <div className="catalog-grid__badges">
                    {badges.map((badge) => (
                      <span
                        key={`${car.id}-${badge.label}`}
                        className={`catalog-badge catalog-badge--${badge.tone}`}
                      >
                        {badge.label}
                      </span>
                    ))}
                  </div>
                )}
                <Image
                  src={getLineupCarImage(car.slug, car.images)}
                  alt={car.name}
                  width={245}
                  height={160}
                  sizes="(max-width:767px) 50vw, 245px"
                  className="catalog-grid__photo"
                />
              </div>
              <div className="catalog-grid__text">
                <p className="catalog-grid__name">{car.name.toUpperCase()}</p>
                <p className="catalog-grid__price-label">Price</p>
                <p className="catalog-grid__price">{getPriceLabel(car)}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
