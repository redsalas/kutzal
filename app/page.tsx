import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-grey-100 flex items-center justify-center overflow-hidden">
        {/* Placeholder for hero image */}
        <div className="absolute inset-0 bg-gradient-to-r from-grey-900/70 to-grey-900/50 z-10"></div>
        <div className="absolute inset-0 bg-grey-400 flex items-center justify-center">
          <div className="text-grey-600 text-center">
            <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm">Imagen del Hero</p>
          </div>
        </div>
        
        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-serif italic mb-4">
            A REVOLUTIONARY YOU
          </h1>
        </div>

        {/* Carousel Navigation Arrows */}
        <button className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-olive-300 transition-colors">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:text-olive-300 transition-colors">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </section>

      {/* Main Content Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Logo Placeholder */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-80 h-80 bg-olive-200 rounded-full flex items-center justify-center">
                  <div className="text-grey-700 text-center">
                    <svg className="w-40 h-40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">Logo Placeholder</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 text-9xl font-serif italic text-grey-200 opacity-50">
                  Kutzal
                </div>
              </div>
            </div>

            {/* Right Side - Content */}
            <div>
              <h2 className="text-4xl md:text-5xl font-serif italic mb-6 text-grey-800">
                A REVOLUTIONARY YOU
              </h2>
              <h3 className="text-xl text-grey-600 mb-6">
                Clases de Pilates Reformer y Functional Training
              </h3>
              <p className="text-grey-700 mb-8 leading-relaxed">
                Kutzal fusiona vitalidad física con bienestar mental y espiritual en un ambiente de sofisticación y energía.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/planes"
                  className="bg-olive-700 hover:bg-olive-800 text-white px-8 py-3 rounded-full transition-colors duration-200"
                >
                  Ver planes
                </Link>
                <Link
                  href="/contacto"
                  className="bg-white hover:bg-grey-50 text-grey-800 px-8 py-3 rounded-full border-2 border-grey-300 transition-colors duration-200"
                >
                  Reservar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Image Section with People */}
      <section className="py-20 px-4 bg-grey-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Watermark */}
            <div className="flex justify-center lg:justify-start">
              <div className="text-9xl font-serif italic text-grey-200">
                Kutzal
              </div>
            </div>

            {/* Right Side - Image Placeholder */}
            <div className="relative">
              <div className="relative h-96 bg-olive-200 rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-grey-600">
                  <div className="text-center">
                    <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">Imagen de personas</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-olive-100 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Image Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Side - Watermark */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <div className="text-9xl font-serif italic text-grey-200">
                Kutzal
              </div>
            </div>

            {/* Right Side - Image Placeholder */}
            <div className="relative order-1 lg:order-2">
              <div className="relative h-96 bg-olive-200 rounded-[3rem] overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-grey-600">
                  <div className="text-center">
                    <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-sm">Imagen de personas</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-olive-100 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

// Made with Bob
