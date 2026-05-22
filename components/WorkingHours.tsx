export default function WorkingHours() {
  const schedule = [
    {
      day: 'Lunes a viernes (Mañanas)',
      hours: '6.00 am - 12.00 pm',
    },
    {
      day: 'Lunes a viernes (Tardes)',
      hours: '5.00 pm - 9.00 pm',
    },
    {
      day: 'Sábado',
      hours: '8:00 pm a 12:00 pm',
    },
    {
      day: 'Domingo',
      hours: '9:00 am a 11:00 am',
    },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-grey-300">
        <div className="absolute inset-0 flex items-center justify-center text-grey-500">
          <div className="text-center">
            <svg className="w-32 h-32 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-sm">Imagen de fondo (personas)</p>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Schedule Card */}
          <div className="bg-white rounded-[3rem] p-12 shadow-lg max-w-2xl">
            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-serif mb-6 text-grey-800 text-center">
              Nuestros horarios
            </h2>

            {/* Description */}
            <p className="text-grey-600 text-center mb-10 leading-relaxed">
              Donec lorem arcu, pulvinar a leo a, sodales tristique est. Pellentesque quis erat eu mi viverra suscipit vel at ligula.
            </p>

            {/* Schedule List */}
            <div className="space-y-6">
              {schedule.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center pb-4 border-b border-grey-200 last:border-b-0"
                >
                  <span className="text-grey-800 font-medium text-lg">
                    {item.day}
                  </span>
                  <span className="text-grey-600 italic text-lg">
                    {item.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Empty space for image background to show */}
          <div className="hidden lg:block"></div>
        </div>
      </div>
    </section>
  );
}

