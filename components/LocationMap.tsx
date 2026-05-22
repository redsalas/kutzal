export default function LocationMap() {
  // Replace this with your actual Google Maps embed URL
  // To get the embed URL: Go to Google Maps > Search for your location > Click Share > Embed a map > Copy HTML
  const mapEmbedUrl = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.8!2d-99.1332!3d19.4326!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDI1JzU3LjQiTiA5OcKwMDcnNTkuNSJX!5e0!3m2!1sen!2smx!4v1234567890";

  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-serif italic mb-4 text-grey-800">
            Encuéntranos
          </h2>
          <p className="text-grey-600 text-lg max-w-2xl mx-auto">
            Visítanos en nuestro estudio y descubre el espacio perfecto para tu transformación.
          </p>
        </div>

        {/* Map Container */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-grey-200">
          <div className="relative w-full h-[500px] bg-grey-200">
            {/* Google Maps Embed */}
            <iframe
              src={mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Kutzal Location Map"
              className="absolute inset-0"
            ></iframe>
            
            {/* Fallback placeholder if map doesn't load */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-grey-500 text-center">
                <svg className="w-24 h-24 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-olive-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-olive-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-grey-800 mb-2">Dirección</h3>
            <p className="text-grey-600">
              Calle Principal #123<br />
              Colonia Centro<br />
              Ciudad de México, CDMX
            </p>
          </div>

          <div className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-olive-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-olive-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-grey-800 mb-2">Teléfono</h3>
            <p className="text-grey-600">
              +52 55 1234 5678
            </p>
          </div>

          <div className="p-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-olive-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-olive-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-semibold text-grey-800 mb-2">Email</h3>
            <p className="text-grey-600">
              info@kutzal.com
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

