import PricingCards from '@/components/PricingCards';
import WorkingHours from '@/components/WorkingHours';
import LocationMap from '@/components/LocationMap';
import ImageSection from '@/components/ImageSection';
import HeroSection from '@/components/HeroSection';
import MainContentSection from '@/components/MainContentSection';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <HeroSection
        title="A REVOLUTIONARY YOU"
        showCarouselControls={true}
      />

      {/* Main Content Section */}
      <MainContentSection
        title="A REVOLUTIONARY YOU"
        subtitle="Clases de Pilates Reformer y Functional Training"
        description="Kutzal fusiona vitalidad física con bienestar mental y espiritual en un ambiente de sofisticación y energía."
        primaryButtonText="Ver planes"
        primaryButtonLink="/planes"
        secondaryButtonText="Reservar"
        secondaryButtonLink="/contacto"
        watermarkText="Kutzal"
      />

      {/* Image Section with People - Right */}
      <ImageSection
        watermarkText="Kutzal"
        imagePosition="right"
        backgroundColor="bg-grey-50"
        imageAlt="Kutzal team"
      />

      {/* Image Section with People - Left */}
      <ImageSection
        watermarkText="Kutzal"
        imagePosition="left"
        backgroundColor="bg-white"
        imageAlt="Kutzal training"
      />

      {/* Pricing Cards Section */}
      <PricingCards />

      {/* Location Map Section */}
      <LocationMap />

      {/* Working Hours Section */}
      <WorkingHours />
    </div>
  );
}


