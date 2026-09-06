import Image from 'next/image';

interface AboutSectionProps {
  title?: string;
  subtitle?: string;
  paragraphs?: string[];
  imageSrc?: string;
  mobileSrc?: string;
}

export default function AboutSection({
  title = '¿Por qué',
  subtitle = 'Kutzal?',
  paragraphs = [
    'Su nombre está inspirado en Ka Kutzal, una expresión maya asociada con "volver a la vida" y "renacer". Y para mí, eso representa perfectamente lo que significa el Pilates: una oportunidad para volver a conectar con tu cuerpo, escucharlo, conocerlo y descubrir todo lo que es capaz de hacer.',
    'Cuando conocí el Pilates, entendí que no se trataba solamente de hacer ejercicio. El método clásico de Joseph Pilates me enseñó que cada movimiento tiene un propósito; que respirar, controlar, concentrarse y moverse con precisión puede transformar mucho más que nuestro cuerpo.',
    'Por eso quiero que este espacio sea mucho más que un estudio de Pilates. Quiero que sea un lugar donde puedas renacer en movimiento: fortalecer tu cuerpo, conectar contigo, disfrutar el proceso y descubrir una nueva relación con tu bienestar.',
  ],
  imageSrc = '/images/bg-cover-large-4.webp',
  mobileSrc,
}: AboutSectionProps) {
  return (
    <section id="about" className="relative w-full min-h-[calc(100svh-5rem)] overflow-hidden flex items-center">
      {/* Background image — desktop */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={imageSrc}
          alt="Kutzal about background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-grey-900/85 via-grey-900/60 to-grey-900/20" />
      </div>

      {/* Background image — mobile */}
      <div className="absolute inset-0 block md:hidden">
        <Image
          src={mobileSrc ?? imageSrc}
          alt="Kutzal about background"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-grey-900/85 via-grey-900/70 to-grey-900/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-2xl px-8 md:px-16 py-16">
        {/* Large bold title */}
        <h2 className="text-6xl md:text-8xl font-display font-extrabold leading-tight text-white mb-8">
          {title}
          <br />
          <span className="text-olive-200">{subtitle}</span>
        </h2>

        {/* Description */}
        <div className="space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-white/90 text-sm md:text-base leading-relaxed">
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
