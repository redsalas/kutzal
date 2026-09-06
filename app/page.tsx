import PricingCards from '@/components/PricingCards';
import WorkingHours from '@/components/WorkingHours';
import LocationMap from '@/components/LocationMap';
import ImageSection from '@/components/ImageSection';
import HeroSection from '@/components/HeroSection';
import MainContentSection from '@/components/MainContentSection';
import AboutSection from '@/components/AboutSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="A REVOLUTIONARY YOU"
        carousel={true}
        mobileSrc='/images/bg-cover-mobile-1.jpg'
      />

      <AboutSection mobileSrc='/images/bg-cover-mobile-2.jpg' />

      {/* Main Content Section */}
      <MainContentSection
        logoSrc='/images/kutzal-bg-banner.png'
        title="A REVOLUTIONARY YOU"
        subtitle="Clases de Pilates Reformer y Functional Training"
        description="En Kutzal, honramos el método clásico de Joseph Pilates a través de sesiones de Reformer que cultivan fuerza, precisión y equilibrio, integrando bienestar físico, mental y espiritual en un entorno de sofisticación y energía."
        primaryButtonText="Ver clases"
        primaryButtonLink="/clases"
        secondaryButtonText="Reservar"
        secondaryButtonLink="/reservar"
        watermarkText=""
      />

      {/* Pricing Cards Section */}
      <PricingCards />

      {/* Working Hours Section */}
      <WorkingHours />

      {/* Location Map Section */}
      <LocationMap />

    </div>
  );
}


