import Link from 'next/link';

export default function PricingCards() {
  const pricingPlans = [
    {
      price: '$170',
      unit: '/ Clase',
      title: 'FIRST DATE',
      subtitle: 'Acceso a 1 clases Expira en 15 Días',
      description: 'Una clase de prueba en cualquier disciplina.',
      buttonText: 'Get Started',
    },
    {
      price: '$260',
      unit: '/ MXN',
      title: 'SINGLE CLASS',
      subtitle: 'Expira en 15 Días',
      description: 'Una clase en cualquier disciplina',
      buttonText: 'Get Started',
    },
  ];

  return (
    <section className="py-20 px-4 bg-grey-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif italic mb-4 text-grey-800">
              Join us today!
            </h2>
            <p className="text-grey-600 text-lg">
              Puedes usar tus clases para reservar cualquiera de nuestros entrenamientos.
            </p>
          </div>
          <Link
            href="/planes"
            className="mt-6 md:mt-0 bg-olive-700 hover:bg-olive-800 text-white px-8 py-3 rounded-lg transition-colors duration-200"
          >
            Ver todos
          </Link>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {pricingPlans.map((plan, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 border border-grey-200"
            >
              {/* Price */}
              <div className="mb-6">
                <span className="text-5xl font-bold text-grey-900">{plan.price}</span>
                <span className="text-grey-600 text-lg ml-2">{plan.unit}</span>
              </div>

              {/* Title */}
              <h3 className="text-2xl font-serif mb-3 text-grey-800">
                {plan.title}
              </h3>

              {/* Subtitle */}
              <p className="text-grey-700 text-sm mb-4">
                {plan.subtitle}
              </p>

              {/* Description */}
              <p className="text-grey-600 mb-8 min-h-[3rem]">
                {plan.description}
              </p>

              {/* Button */}
              <button className="w-full bg-olive-700 hover:bg-olive-800 text-white py-4 rounded-xl transition-colors duration-200 font-medium">
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

