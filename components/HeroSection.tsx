'use client';

import { useState } from 'react';
import Image from 'next/image';

const HERO_IMAGES = [
  '/images/bg-cover-large-2.webp',
  '/images/bg-cover-large-3.webp',
  '/images/bg-cover-large-4.webp',
];

const HERO_IMAGES_MOBILE = [
  '/images/bg-cover-mobile-1.webp',
  '/images/bg-cover-mobile-2.webp',
  '/images/bg-cover-mobile-3.webp',
  '/images/bg-cover-mobile-4.webp',
];

interface HeroSectionProps {
  title?: string;
  imageSrc?: string;
  mobileSrc?: string;
  carousel?: boolean;
}

export default function HeroSection({
  title = 'A REVOLUTIONARY YOU',
  imageSrc,
  mobileSrc,
  carousel = false,
}: HeroSectionProps) {
  const [current, setCurrent] = useState(0);

  const images = carousel ? HERO_IMAGES : (imageSrc ? [imageSrc] : HERO_IMAGES);
  const mobileImages = carousel ? HERO_IMAGES_MOBILE : (mobileSrc ? [mobileSrc] : images);

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  return (
    <section className="relative h-[calc(100svh-5rem)] bg-grey-100 flex items-center justify-center overflow-hidden">
      {/* Background Image — desktop */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={images[current]}
          alt="Hero background"
          fill
          className="object-cover"
        />
      </div>

      {/* Background Image — mobile */}
      <div className="absolute inset-0 block md:hidden">
        <Image
          src={mobileImages[current]}
          alt="Hero background"
          fill
          className="object-cover"
        />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-grey-900/70 to-grey-900/50 z-10"></div>

      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-display mb-4">
          {title}
        </h1>
      </div>

      {/* Carousel Navigation Arrows */}
      {carousel && (
        <>
          <button
            onClick={prev}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-olive-300 transition-colors"
            aria-label="Previous slide"
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={next}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-olive-300 transition-colors"
            aria-label="Next slide"
          >
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}
    </section>
  );
}

