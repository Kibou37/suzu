import type { CarDetail } from '@/lib/api';
import { getCarSpecGroups } from '@/lib/car-specs';

type CarSpecsSectionProps = {
  car: CarDetail;
};

export function CarSpecsSection({ car }: CarSpecsSectionProps) {
  const groups = getCarSpecGroups(car);

  return (
    <section className="car-specs" aria-labelledby="car-specs-title">
      <div className="container-suzuki">
        <h2 id="car-specs-title" className="car-specs__title">
          Technical specifications
        </h2>

        {car.description && <p className="car-specs__intro">{car.description}</p>}

        <div className="car-specs__groups">
          {groups.map((group) => (
            <div key={group.title} className="car-specs__group">
              <h3 className="car-specs__group-title">{group.title}</h3>
              <dl className="car-specs__table">
                {group.items.map((item) => (
                  <div key={item.label} className="car-specs__row">
                    <dt className="car-specs__label">{item.label}</dt>
                    <dd className="car-specs__value">{item.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
