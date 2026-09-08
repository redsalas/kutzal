import Link from 'next/link';
import Image from 'next/image';

export default function PricingCards() {
  const pricingPlans = [
    {
      price: 'Gratis',
      unit: '',
      title: 'CLASE MUESTRA',
      subtitle: 'Tu primera clase sin costo',
      description: 'Ven a conocer el estudio y experimenta el Pilates sin ningún compromiso.',
      buttonText: 'Reservar',
      href: '/reservar',
    },
    {
      price: '$135',
      unit: '/ MXN',
      title: '1 CLASE',
      subtitle: 'Clase individual',
      description: 'Accede a una clase de Pilates en el horario que mejor te convenga.',
      buttonText: 'Reservar',
      href: '/reservar',
    },
  ];

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <Image
          src="/images/DSC00480.webp"
          alt="Pricing background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-grey-900/70" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-display italic mb-4 text-white">
              Join us today!
            </h2>
            <p className="text-white/70 text-lg">
              Puedes usar tus clases para reservar cualquiera de nuestros entrenamientos.
            </p>
          </div>
          <Link
            href="/clases"
            className="mt-6 md:mt-0 bg-white/20 hover:bg-white/30 border border-white/40 text-white px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Ver todos
          </Link>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 hover:bg-white/15 transition-colors duration-300"
            >
              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                {plan.unit && <span className="text-white/60 text-lg ml-2">{plan.unit}</span>}
              </div>

              {/* Title */}
              <h3 className="text-2xl font-display mb-3 text-white">
                {plan.title}
              </h3>

              {/* Subtitle */}
              <p className="text-white/70 text-sm mb-4">
                {plan.subtitle}
              </p>

              {/* Description */}
              <p className="text-white/60 mb-8 min-h-[3rem]">
                {plan.description}
              </p>

              {/* Button */}
              <Link
                href={plan.href}
                className="block w-full text-center bg-olive-700 hover:bg-olive-800 text-white py-4 rounded-xl transition-colors duration-200 font-medium"
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

