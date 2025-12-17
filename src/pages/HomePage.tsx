import { HeroSection } from '../components/landing/HeroSection';
import { FeaturesSection } from '../components/landing/FeaturesSection';
import { VideoGallerySection } from '../components/landing/VideoGallerySection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { AppDownloadSection } from '../components/landing/AppDownloadSection';

interface HomePageProps {
  onStartBooking: () => void;
  onCleanerLogin?: () => void;
}

export function HomePage({ onStartBooking, onCleanerLogin }: HomePageProps) {
  return (
    <>
      <HeroSection onStartBooking={onStartBooking} />
      <FeaturesSection />
      <VideoGallerySection />
      <HowItWorksSection />
      <TestimonialsSection />
      <AppDownloadSection onDownload={onCleanerLogin} />
    </>
  );
}