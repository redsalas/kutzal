import Link from 'next/link';
import HeroSection from '@/components/HeroSection';

const pricing = [
  { label: 'Clase muestra', price: 'Gratis', highlight: true },
  { label: '1 clase', price: '$135' },
  { label: 'Paquete de 8', price: '$960' },
  { label: 'Paquete de 12', price: '$1,380' },
  { label: 'Paquete de 16', price: '$1,760' },
  { label: 'Paquete de 20', price: '$2,100' },
];

const weekdayMorning = ['07:00', '08:00', '09:00'];
const weekdayAfternoon = ['05:00', '06:00', '07:00'];
const saturday = ['08:00', '09:00', '10:00'];

export default function ClasesPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <HeroSection 
        title="CLASES"
        imageSrc='/images/bg-cover-large-1.webp'
        carousel={false} 
      />

      {/* About Pilates */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-4">
            Kutzal Studio
          </p>
          <h2 className="text-4xl md:text-5xl font-display italic text-grey-800 mb-6">
            Pilates Reformer
          </h2>
          <p className="text-grey-600 text-lg leading-relaxed mb-6">
            El Pilates Reformer es un método de entrenamiento de bajo impacto que trabaja el cuerpo de
            forma integral, fortaleciendo el core, mejorando la postura y aumentando la flexibilidad.
            A través de un sistema de resortes y poleas, cada ejercicio se realiza con control y precisión,
            lo que permite adaptar la intensidad a cualquier nivel.
          </p>
          <p className="text-grey-600 text-lg leading-relaxed">
            En Kutzal fusionamos la técnica clásica del Pilates con un ambiente de sofisticación y bienestar,
            ofreciendo clases personalizadas en grupos reducidos para que cada alumno reciba la atención
            que merece y alcance sus objetivos de forma segura y efectiva.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-olive-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-3xl font-display italic text-grey-800 text-center mb-12">
            Beneficios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Fortaleza & Core',
                desc: 'Trabaja los músculos profundos del abdomen y espalda para una base sólida y estable.',
              },
              {
                title: 'Postura & Alineación',
                desc: 'Corrige desequilibrios musculares y mejora la alineación corporal en cada movimiento.',
              },
              {
                title: 'Flexibilidad & Movilidad',
                desc: 'Aumenta el rango de movimiento articular y reduce la tensión muscular acumulada.',
              },
            ].map((b) => (
              <div
                key={b.title}
                className="bg-white rounded-2xl p-8 shadow-sm border border-grey-200 text-center"
              >
                <h4 className="text-xl font-semibold text-grey-800 mb-3">{b.title}</h4>
                <p className="text-grey-600 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing + Schedule */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">
              Inversión
            </p>
            <h2 className="text-4xl md:text-5xl font-display italic text-grey-800">
              Precios & Horarios
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Pricing */}
            <div>
              <h3 className="text-2xl font-display text-grey-800 mb-6">Precios</h3>
              <div className="space-y-3">
                {pricing.map((item) => (
                  <div
                    key={item.label}
                    className={`flex justify-between items-center px-6 py-4 rounded-2xl border ${
                      item.highlight
                        ? 'bg-olive-700 border-olive-700 text-white'
                        : 'bg-grey-50 border-grey-200 text-grey-800'
                    }`}
                  >
                    <span className={`font-medium text-lg ${item.highlight ? 'text-white' : 'text-grey-800'}`}>
                      {item.label}
                    </span>
                    <span
                      className={`text-xl font-bold ${
                        item.highlight ? 'text-white' : 'text-olive-700'
                      }`}
                    >
                      {item.price}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <Link
                  href="/reservar"
                  className="block w-full text-center bg-olive-700 hover:bg-olive-800 text-white py-4 rounded-2xl text-lg font-medium transition-colors duration-200"
                >
                  Reservar clase
                </Link>
              </div>
            </div>

            {/* Schedule */}
            <div>
              <h3 className="text-2xl font-display text-grey-800 mb-6">Horarios</h3>

              {/* Lunes a Viernes */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-grey-700 mb-4 pb-2 border-b border-grey-200">
                  Lunes a Viernes
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">AM</p>
                    <div className="space-y-2">
                      {weekdayMorning.map((time) => (
                        <div
                          key={time}
                          className="bg-grey-50 border border-grey-200 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                        >
                          {time}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-olive-600 uppercase mb-3">PM</p>
                    <div className="space-y-2">
                      {weekdayAfternoon.map((time) => (
                        <div
                          key={time}
                          className="bg-grey-50 border border-grey-200 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
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
                <h4 className="text-lg font-semibold text-grey-700 mb-4 pb-2 border-b border-grey-200">
                  Sábado
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {saturday.map((time) => (
                    <div
                      key={time}
                      className="bg-grey-50 border border-grey-200 rounded-xl px-4 py-2 text-grey-800 font-medium text-center"
                    >
                      {time}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
