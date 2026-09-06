import Link from 'next/link';
import Image from 'next/image';

interface MainContentSectionProps {
  logoSrc?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  primaryButtonText?: string;
  primaryButtonLink?: string;
  secondaryButtonText?: string;
  secondaryButtonLink?: string;
  watermarkText?: string;
}

export default function MainContentSection({
  logoSrc,
  title = 'A REVOLUTIONARY YOU',
  subtitle = 'Clases de Pilates Reformer y Functional Training',
  description = 'Kutzal fusiona vitalidad física con bienestar mental y espiritual en un ambiente de sofisticación y energía.',
  primaryButtonText = 'Ver planes',
  primaryButtonLink = '/planes',
  secondaryButtonText = 'Reservar',
  secondaryButtonLink = '/contacto',
  watermarkText,
}: MainContentSectionProps) {
  return (
    <section className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Logo */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-80 h-80 bg-olive-200 rounded-full flex items-center justify-center overflow-hidden">
                {logoSrc ? (
                  <Image
                    src={logoSrc}
                    alt="Kutzal Logo"
                    fill
                    className="object-cover rounded-full"
                  />
                ) : (
                  <div className="text-grey-700 text-center">
                    <svg
                      className="w-40 h-40 mx-auto mb-4"
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
                    <p className="text-sm">Logo Placeholder</p>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-4 -right-4 text-9xl font-display italic text-grey-200 opacity-50">
                {watermarkText}
              </div>
            </div>
          </div>

          {/* Right Side - Content */}
          <div>
            <h2 className="text-4xl md:text-5xl font-display mb-6 text-grey-800">
              {title}
            </h2>
            <h3 className="text-xl text-grey-600 mb-6">{subtitle}</h3>
            <p className="text-grey-700 mb-8 leading-relaxed">
              {description}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={primaryButtonLink}
                className="bg-olive-700 hover:bg-olive-800 text-white px-8 py-3 rounded-full transition-colors duration-200"
              >
                {primaryButtonText}
              </Link>
              <Link
                href={secondaryButtonLink}
                className="bg-white hover:bg-grey-50 text-grey-800 px-8 py-3 rounded-full border-2 border-grey-300 transition-colors duration-200"
              >
                {secondaryButtonText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

