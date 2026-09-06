import Image from 'next/image';

export default function WorkingHours() {
  const weekdayMorning = ["07:00", "08:00", "09:00"];
  const weekdayAfternoon = ["05:00", "06:00", "07:00"];
  const saturday = ["08:00", "09:00", "10:00"];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/kutzal-bg-logo.webp"
          alt="Working hours background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-grey-900/60" />
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Schedule Card */}
          <div className="bg-white/80 rounded-[3rem] p-12 shadow-lg max-w-2xl">
            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-display mb-6 text-grey-800 text-center">
              Nuestros horarios
            </h2>

            {/* Description */}
            <p className="text-grey-600 text-center mb-10 leading-relaxed">
              Ofrecemos clases en horarios flexibles para que puedas integrar el
              Pilates en tu rutina diaria.
            </p>

            {/* Lunes a Viernes */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold text-grey-800 mb-4 pb-2 border-b border-grey-200">
                Lunes a Viernes
              </h3>

              <div className="grid grid-cols-2 gap-6">
                {/* AM */}
                <div>
                  <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">
                    AM
                  </p>
                  <div className="space-y-2">
                    {weekdayMorning.map((time) => (
                      <div
                        key={time}
                        className="bg-grey-50 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>

                {/* PM */}
                <div>
                  <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">
                    PM
                  </p>
                  <div className="space-y-2">
                    {weekdayAfternoon.map((time) => (
                      <div
                        key={time}
                        className="bg-grey-50 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                      >
                        {time}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Sábado */}
            <div>
              <h3 className="text-xl font-semibold text-grey-800 mb-4 pb-2 border-b border-grey-200">
                Sábado
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {saturday.map((time) => (
                  <div
                    key={time}
                    className="bg-grey-50 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                  >
                    {time}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Empty space for image background to show */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </section>
  );
}
