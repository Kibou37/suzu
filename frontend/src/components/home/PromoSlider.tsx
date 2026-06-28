'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export type PromoSlide = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel?: string;
  imageUrl: string;
};

type PromoSliderProps = {
  slides: PromoSlide[];
};

export function PromoSlider({ slides }: PromoSliderProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [slides.length]);

  if (slides.length === 0) return null;

  return (
    <section className="hero-slider">
      {slides.map((item, slideIndex) => (
        <div
          key={item.id}
          className={`hero-slide ${slideIndex === index ? 'hero-slide--active' : ''}`}
          aria-hidden={slideIndex !== index}
        >
          <div className="hero-slide__media">
            <Image
              src={item.imageUrl}
              alt=""
              fill
              priority={slideIndex === 0}
              sizes="100vw"
              className="object-cover"
            />
          </div>

          <div className="hero-slide__content-wrap">
            <div className="container-suzuki">
              <Link href={item.href} className="hero-slide__content">
                <div className="hero-slide__title">{item.eyebrow}</div>
                <div className="hero-slide__text">
                  <h2>{item.title}</h2>
                </div>
                <div className="hero-slide__btn-wrap">
                  <span className="btn btn-secondary">{item.linkLabel ?? 'Learn More'}</span>
                </div>
                <div className="hero-slide__note">{item.description}</div>
              </Link>
            </div>
          </div>
        </div>
      ))}

      {slides.length > 1 && (
        <div className="hero-slider__pagination">
          <div className="container-suzuki">
            <ul className="hero-slider__pagination-list">
              {slides.map((item, slideIndex) => (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-label={`Slide ${slideIndex + 1}`}
                    aria-current={slideIndex === index ? 'true' : undefined}
                    onClick={() => setIndex(slideIndex)}
                    className={`hero-slider__dot ${slideIndex === index ? 'hero-slider__dot--active' : ''}`}
                  />
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
