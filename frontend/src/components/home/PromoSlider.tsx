'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

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

const SWIPE_THRESHOLD_PX = 48;
const DRAG_START_PX = 10;
const AUTO_PLAY_MS = 8000;

export function PromoSlider({ slides }: PromoSliderProps) {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const isDragActive = useRef(false);
  const sliderRef = useRef<HTMLElement>(null);

  const slideCount = slides.length;
  const hasMultipleSlides = slideCount > 1;

  const goTo = useCallback(
    (nextIndex: number) => {
      if (!hasMultipleSlides) return;
      setIndex(((nextIndex % slideCount) + slideCount) % slideCount);
    },
    [hasMultipleSlides, slideCount],
  );

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  useEffect(() => {
    if (!hasMultipleSlides || isDragging) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slideCount);
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(timer);
  }, [hasMultipleSlides, isDragging, slideCount]);

  const finishDrag = useCallback(
    (clientX: number) => {
      const delta = clientX - dragStartX.current;

      if (delta <= -SWIPE_THRESHOLD_PX) {
        goNext();
      } else if (delta >= SWIPE_THRESHOLD_PX) {
        goPrev();
      }

      setDragOffset(0);
      setIsDragging(false);
    },
    [goNext, goPrev],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLElement>) => {
    if (!hasMultipleSlides || (event.pointerType === 'mouse' && event.button !== 0)) {
      return;
    }

    if ((event.target as HTMLElement).closest('.hero-slider__pagination')) {
      return;
    }

    dragStartX.current = event.clientX;
    isDragActive.current = false;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const delta = event.clientX - dragStartX.current;

    if (!isDragActive.current) {
      if (Math.abs(delta) < DRAG_START_PX) {
        return;
      }

      isDragActive.current = true;
      setIsDragging(true);
      sliderRef.current?.setPointerCapture(event.pointerId);
    }

    setDragOffset(delta);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLElement>) => {
    if (!isDragActive.current) {
      return;
    }

    if (sliderRef.current?.hasPointerCapture(event.pointerId)) {
      sliderRef.current.releasePointerCapture(event.pointerId);
    }

    finishDrag(event.clientX);
    isDragActive.current = false;
  };

  const handlePointerCancel = (event: React.PointerEvent<HTMLElement>) => {
    if (!isDragActive.current) {
      return;
    }

    if (sliderRef.current?.hasPointerCapture(event.pointerId)) {
      sliderRef.current.releasePointerCapture(event.pointerId);
    }

    finishDrag(event.clientX);
    isDragActive.current = false;
  };

  if (slideCount === 0) return null;

  return (
    <section
      ref={sliderRef}
      className={`hero-slider${isDragging ? ' hero-slider--dragging' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
    >
      <div
        className="hero-slider__track"
        style={{
          transform: `translate3d(calc(${-index * 100}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging ? 'none' : 'transform 0.45s ease',
        }}
      >
        {slides.map((item, slideIndex) => (
          <div
            key={item.id}
            className="hero-slide"
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
                draggable={false}
              />
            </div>

            <div className="hero-slide__content-wrap">
              <div className="container-suzuki">
                <Link href={item.href} className="hero-slide__content" draggable={false}>
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
      </div>

      {hasMultipleSlides && (
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
