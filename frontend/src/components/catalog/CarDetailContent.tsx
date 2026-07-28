import Link from 'next/link';
import { CarGallery } from '@/components/catalog/CarGallery';
import { ViewItemTracker } from '@/components/catalog/ViewItemTracker';
import { FinanceCalculator } from '@/components/finance/FinanceCalculator';
import { carTechByModel } from '@/data/car-tech';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { CarDetail } from '@/lib/api';
import { getCarImageUrl } from '@/lib/car-images';
import {
  formatBodyType,
  formatMileage,
  formatPrice,
  formatTransmission,
} from '@/lib/format';
import { resolveLineupSlug } from '@/lib/lineup-assets';

type CarDetailContentProps = {
  car: CarDetail;
};

const techItems = (car: CarDetail): [string, string][] => {
  const modelTech = carTechByModel[resolveLineupSlug(car.slug)];
  const items: [string, string][] = [
    ['Body type', formatBodyType(car.bodyType)],
    ['Engine', modelTech?.engine ?? '—'],
    ['Transmission', formatTransmission(car.transmission)],
    ['Drive', modelTech?.drive ?? '—'],
  ];

  if (car.horsepower) {
    items.push(['Power', `${car.horsepower} hp`]);
  }

  items.push(['Model year', String(car.year)]);

  if (car.mileage > 0) {
    items.push(['Mileage', formatMileage(car.mileage)]);
  }

  return items;
};

export function CarDetailContent({ car }: CarDetailContentProps) {
  const imageUrl = getCarImageUrl(car.images, car.name, car.slug);
  const galleryImages = car.images.map((src) => getCarImageUrl([src], car.name, car.slug));
  const price = Number(car.price);

  return (
    <article className="model-page">
      <ViewItemTracker itemId={car.slug} itemName={car.name} price={price} />
      <div className="showroom-bg">
        <div className="container-suzuki">
          <Breadcrumbs
            items={[
              { label: 'Home', href: '/' },
              { label: 'Automobiles', href: '/catalog' },
              { label: `Suzuki ${car.name}` },
            ]}
          />
        </div>
      </div>

      <section className="showroom-model showroom-model--page">
        <div className="container-suzuki">
          <div className="showroom-model__row">
            <div className="showroom-model__pic-block">
              <CarGallery images={galleryImages} alt={car.name} fallback={imageUrl} />
              {car.condition === 'USED' && (
                <span className="catalog-badge catalog-badge--used showroom-model__badge">Pre-owned</span>
              )}
            </div>

            <div className="showroom-model__info">
              <h1 className="model-page__title">Suzuki {car.name}</h1>

              <div className="showroom-model__tech-grid">
                {techItems(car).map(([label, value]) => (
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
                <Link href={`/configurator?model=${car.slug}`} className="btn btn-primary">
                  Configure
                </Link>
                <Link href={`/test-drive?model=${car.slug}`} className="btn btn-secondary">
                  Test Drive
                </Link>
                <Link
                  href={`/finance?price=${Math.round(price)}&model=${encodeURIComponent(car.slug)}`}
                  className="btn btn-secondary"
                >
                  Finance
                </Link>
                <Link href="/dealers" className="link-action">
                  Contact Dealer
                </Link>
              </div>
            </div>
          </div>

          {price > 0 ? (
            <div className="model-page__finance">
              <FinanceCalculator
                compact
                initialPrice={price}
                carSlug={car.slug}
                carName={car.name}
              />
            </div>
          ) : null}
        </div>
      </section>
    </article>
  );
}
