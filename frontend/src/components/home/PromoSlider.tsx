'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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

type LoopSlide = PromoSlide & {
  loopKey: string;
};

const SWIPE_THRESHOLD_PX = 48;
const DRAG_START_PX = 10;
const AUTO_PLAY_MS = 8000;

function buildLoopSlides(slides: PromoSlide[]): LoopSlide[] {
  if (slides.length <= 1) {
    return slides.map((slide) => ({ ...slide, loopKey: slide.id }));
  }

  const last = slides[slides.length - 1];
  const first = slides[0];

  return [
    { ...last, loopKey: `${last.id}-loop-start` },
    ...slides.map((slide) => ({ ...slide, loopKey: slide.id })),
    { ...first, loopKey: `${first.id}-loop-end` },
  ];
}

function getActiveSlideIndex(position: number, slideCount: number): number {
  if (slideCount <= 1) return 0;
  if (position === 0) return slideCount - 1;
  if (position === slideCount + 1) return 0;
  return position - 1;
}

export function PromoSlider({ slides }: PromoSliderProps) {
  const slideCount = slides.length;
  const hasMultipleSlides = slideCount > 1;
  const loopSlides = useMemo(() => buildLoopSlides(slides), [slides]);

  const [position, setPosition] = useState(hasMultipleSlides ? 1 : 0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [transitionEnabled, setTransitionEnabled] = useState(true);

  const dragStartX = useRef(0);
  const isDragActive = useRef(false);
  const sliderRef = useRef<HTMLElement>(null);

  const activeIndex = getActiveSlideIndex(position, slideCount);

  const goNext = useCallback(() => {
    if (!hasMultipleSlides) return;
    setTransitionEnabled(true);
    setPosition((current) => current + 1);
  }, [hasMultipleSlides]);

  const goPrev = useCallback(() => {
    if (!hasMultipleSlides) return;
    setTransitionEnabled(true);
    setPosition((current) => current - 1);
  }, [hasMultipleSlides]);

  const goToSlide = useCallback(
    (slideIndex: number) => {
      if (!hasMultipleSlides) return;
      setTransitionEnabled(true);
      setPosition(slideIndex + 1);
    },
    [hasMultipleSlides],
  );

  useEffect(() => {
    if (!hasMultipleSlides || isDragging) return;

    const timer = window.setInterval(goNext, AUTO_PLAY_MS);
    return () => window.clearInterval(timer);
  }, [goNext, hasMultipleSlides, isDragging]);

  const handleTrackTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== 'transform') {
      return;
    }

    if (!hasMultipleSlides) return;

    if (position === 0) {
      setTransitionEnabled(false);
      setPosition(slideCount);
    } else if (position === slideCount + 1) {
      setTransitionEnabled(false);
      setPosition(1);
    }
  };

  useEffect(() => {
    if (!transitionEnabled) {
      const frame = window.requestAnimationFrame(() => {
        setTransitionEnabled(true);
      });
      return () => window.cancelAnimationFrame(frame);
    }
  }, [transitionEnabled, position]);

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
        onTransitionEnd={handleTrackTransitionEnd}
        style={{
          transform: `translate3d(calc(${-position * 100}% + ${dragOffset}px), 0, 0)`,
          transition: isDragging || !transitionEnabled ? 'none' : 'transform 0.45s ease',
        }}
      >
        {loopSlides.map((item, slideIndex) => (
          <div
            key={item.loopKey}
            className="hero-slide"
            aria-hidden={hasMultipleSlides ? slideIndex !== position : slideIndex !== 0}
          >
            <div className="hero-slide__media">
              <Image
                src={item.imageUrl}
                alt=""
                fill
                priority={item.id === slides[0]?.id}
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
                    aria-current={slideIndex === activeIndex ? 'true' : undefined}
                    onClick={() => goToSlide(slideIndex)}
                    className={`hero-slider__dot ${slideIndex === activeIndex ? 'hero-slider__dot--active' : ''}`}
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
