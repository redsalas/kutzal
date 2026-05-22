interface HeroSectionProps {
  title?: string;
  backgroundImage?: string;
  showCarouselControls?: boolean;
}

export default function HeroSection({
  title = 'A REVOLUTIONARY YOU',
  backgroundImage,
  showCarouselControls = true,
}: HeroSectionProps) {
  return (
    <section className="relative h-[600px] bg-grey-100 flex items-center justify-center overflow-hidden">
      {/* Background Image or Placeholder */}
      {backgroundImage ? (
        <div className="absolute inset-0">
          <img
            src={backgroundImage}
            alt="Hero background"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="absolute inset-0 bg-grey-400 flex items-center justify-center">
          <div className="text-grey-600 text-center">
            <svg
              className="w-32 h-32 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-sm">Imagen del Hero</p>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-grey-900/70 to-grey-900/50 z-10"></div>

      {/* Content */}
      <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-serif italic mb-4">
          {title}
        </h1>
      </div>

      {/* Carousel Navigation Arrows */}
      {showCarouselControls && (
        <>
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-olive-300 transition-colors"
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
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-olive-300 transition-colors"
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

