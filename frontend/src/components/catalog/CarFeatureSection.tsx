import Image from 'next/image';
import type { ReactNode } from 'react';

type CarFeatureSectionProps = {
  title: string;
  image: string;
  imageAlt: string;
  reverse?: boolean;
  children: ReactNode;
};

export function CarFeatureSection({
  title,
  image,
  imageAlt,
  reverse = false,
  children,
}: CarFeatureSectionProps) {
  return (
    <section className={`model-feature${reverse ? ' model-feature--reverse' : ''}`}>
      <div className="container-suzuki">
        <div className="model-feature__row">
          <div className="model-feature__media">
            <Image
              src={image}
              alt={imageAlt}
              width={640}
              height={420}
              sizes="(max-width:991px) 100vw, 50vw"
              className="model-feature__image"
            />
          </div>
          <div className="model-feature__content">
            <h2 className="model-feature__title">{title}</h2>
            <div className="model-feature__text">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
