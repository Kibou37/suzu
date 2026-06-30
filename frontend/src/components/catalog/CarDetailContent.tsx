import Image from 'next/image';
import Link from 'next/link';
import { CarSpecsSection } from '@/components/catalog/CarSpecsSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { CarDetail } from '@/lib/api';
import { getCarImageUrl } from '@/lib/car-images';
import {
  formatBodyType,
  formatCondition,
  formatFuelType,
  formatMileage,
  formatPrice,
  formatTransmission,
} from '@/lib/format';

type CarDetailContentProps = {
  car: CarDetail;
};

const heroHighlights = (car: CarDetail) => {
  const items: [string, string][] = [
    ['Trim', car.trim ?? '—'],
    ['Body type', formatBodyType(car.bodyType)],
    ['Engine', formatFuelType(car.fuelType)],
    ['Transmission', formatTransmission(car.transmission)],
  ];

  if (car.horsepower) {
    items.push(['Power', `${car.horsepower} hp`]);
  }

  items.push(['Model year', String(car.year)]);

  if (car.mileage > 0) {
    items.push(['Mileage', formatMileage(car.mileage)]);
  }

  if (car.condition === 'USED') {
    items.push(['Condition', formatCondition(car.condition)]);
  }

  return items;
};

export function CarDetailContent({ car }: CarDetailContentProps) {
  const imageUrl = getCarImageUrl(car.images, car.name, car.slug);
  const price = Number(car.price);

  return (
    <article className="model-page">
      <div className="showroom-bg">
        <div className="container-suzuki">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Automobiles', href: '/catalog' },
              { label: `Suzuki ${car.name}` },
            ]}
          />
          <h1 className="model-page__title">Suzuki {car.name}</h1>
        </div>
      </div>

      <section className="showroom-model showroom-model--page">
        <div className="container-suzuki">
          <div className="showroom-model__row">
            <div className="showroom-model__pic-block">
              <Image
                src={imageUrl}
                alt={car.name}
                width={470}
                height={282}
                priority
                sizes="(max-width:991px) 100vw, 470px"
                className="showroom-model__pic-image"
              />
            </div>

            <div className="showroom-model__info">
              <div className="showroom-model__tech-grid">
                {heroHighlights(car).map(([label, value]) => (
                  <div key={label} className="showroom-model__tech-item">
                    <div className="showroom-model__label">{label}</div>
                    <div className="showroom-model__tech">{value}</div>
                  </div>
                ))}
              </div>

              <div className="showroom-model__price-block">
                {car.isOffer && car.offerLabel && (
                  <span className="showroom-model__offer">{car.offerLabel}</span>
                )}
                <p className="showroom-model__price-label">Price</p>
                <p className="showroom-model__price">
                  {price > 0 ? formatPrice(car.price) : 'Request price from dealer'}
                </p>
              </div>

              <div className="showroom-model__actions">
                <Link href="/configurator" className="btn btn-primary">
                  Configure
                </Link>
                <Link href="/test-drive" className="btn btn-secondary">
                  Test Drive
                </Link>
                <Link href="/contacts" className="link-action">
                  Contact Dealer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <CarSpecsSection car={car} />
    </article>
  );
}
