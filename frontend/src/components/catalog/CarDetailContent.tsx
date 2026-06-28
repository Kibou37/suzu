import Image from 'next/image';
import Link from 'next/link';
import { CarFeatureSection } from '@/components/catalog/CarFeatureSection';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import type { CarDetail } from '@/lib/api';
import { getCarImageUrl } from '@/lib/car-images';
import {
  formatBodyType,
  formatFuelType,
  formatPrice,
  formatTransmission,
} from '@/lib/format';
import { getLineupCarImage } from '@/lib/lineup-assets';

type CarDetailContentProps = {
  car: CarDetail;
};

const techItems = (car: CarDetail) =>
  [
    ['Body type', formatBodyType(car.bodyType)],
    ['Engine', formatFuelType(car.fuelType)],
    ['Transmission', formatTransmission(car.transmission)],
    ['Model year', String(car.year)],
  ] as const;

export function CarDetailContent({ car }: CarDetailContentProps) {
  const imageUrl = getCarImageUrl(car.images, car.name, car.slug);
  const lineupImage = getLineupCarImage(car.slug, car.images);
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

      {car.description && (
        <CarFeatureSection
          title={`Overview Suzuki ${car.name}`}
          image={lineupImage}
          imageAlt={car.name}
        >
          <p>{car.description}</p>
        </CarFeatureSection>
      )}
    </article>
  );
}
