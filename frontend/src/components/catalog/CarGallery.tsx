'use client';

import { useState } from 'react';
import Image from 'next/image';

type CarGalleryProps = {
  images: string[];
  alt: string;
  fallback: string;
};

export function CarGallery({ images, alt, fallback }: CarGalleryProps) {
  const sources = images.length > 0 ? images : [fallback];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSrc = sources[activeIndex] ?? fallback;

  return (
    <div className="car-gallery">
      <div className="car-gallery__main">
        <Image
          src={activeSrc}
          alt={alt}
          width={470}
          height={282}
          priority
          sizes="(max-width:991px) 100vw, 470px"
          className="showroom-model__pic-image"
        />
      </div>
      {sources.length > 1 && (
        <ul className="car-gallery__thumbs" aria-label="Vehicle photos">
          {sources.map((src, index) => (
            <li key={`${src}-${index}`}>
              <button
                type="button"
                className={`car-gallery__thumb${index === activeIndex ? ' car-gallery__thumb--active' : ''}`}
                aria-label={`Photo ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => setActiveIndex(index)}
              >
                <Image src={src} alt="" width={72} height={48} className="car-gallery__thumb-img" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
