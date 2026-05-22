interface ImageSectionProps {
  watermarkText?: string;
  imageSrc?: string;
  imageAlt?: string;
  imagePosition?: 'left' | 'right';
  backgroundColor?: string;
}

export default function ImageSection({
  watermarkText = 'Kutzal',
  imageSrc,
  imageAlt = 'Kutzal image',
  imagePosition = 'right',
  backgroundColor = 'bg-grey-50',
}: ImageSectionProps) {
  const isImageRight = imagePosition === 'right';

  return (
    <section className={`py-20 px-4 ${backgroundColor}`}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Watermark Side */}
          <div
            className={`flex justify-center lg:justify-start ${
              isImageRight ? 'order-1' : 'order-2 lg:order-1'
            }`}
          >
            <div className="text-9xl font-serif italic text-grey-200">
              {watermarkText}
            </div>
          </div>

          {/* Image Side */}
          <div
            className={`relative ${
              isImageRight ? 'order-2' : 'order-1 lg:order-2'
            }`}
          >
            <div className="relative h-96 bg-olive-200 rounded-[3rem] overflow-hidden">
              {imageSrc ? (
                <img
                  src={imageSrc}
                  alt={imageAlt}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-grey-600">
                  <div className="text-center">
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
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <p className="text-sm">Imagen de personas</p>
                  </div>
                </div>
              )}
            </div>
            {/* Decorative Circle */}
            <div
              className={`absolute w-32 h-32 bg-olive-100 rounded-full -z-10 ${
                isImageRight
                  ? '-top-8 -right-8'
                  : '-bottom-8 -left-8'
              }`}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}

