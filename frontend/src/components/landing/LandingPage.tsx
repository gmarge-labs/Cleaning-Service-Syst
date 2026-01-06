import { Header } from './Header';
import { HeroSection } from './HeroSection';
import { FeaturesSection } from './FeaturesSection';
import { HowItWorksSection } from './HowItWorksSection';
import { PricingSection } from './PricingSection';
import { TestimonialsSection } from './TestimonialsSection';
import { AppDownloadSection } from './AppDownloadSection';
import { Footer } from './Footer';
import { ChatWidget } from '../chatbot/ChatWidget';

interface LandingPageProps {
  onStartBooking: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
  onNavigateToDashboard: () => void;
  onAdminLogin?: () => void;
  onSupervisorLogin?: () => void;
  onSupportLogin?: () => void;
  onCleanerLogin?: () => void;
}

export function LandingPage({ 
  onStartBooking, 
  onLogin, 
  isAuthenticated,
  onNavigateToDashboard,
  onAdminLogin,
  onSupervisorLogin,
  onSupportLogin,
  onCleanerLogin
}: LandingPageProps) {
  return (
    <div className="min-h-screen">
      <Header 
        onStartBooking={onStartBooking}
        onLogin={onLogin}
        isAuthenticated={isAuthenticated}
        onNavigateToDashboard={onNavigateToDashboard}
        onAdminLogin={onAdminLogin}
        onSupervisorLogin={onSupervisorLogin}
        onSupportLogin={onSupportLogin}
      />
      <div className="pt-10">
        <HeroSection onStartBooking={onStartBooking} />
        <FeaturesSection />
        <HowItWorksSection />
        <PricingSection onGetQuote={onStartBooking} />
        <TestimonialsSection />
        <AppDownloadSection onDownload={onCleanerLogin} />
        <Footer onAdminLogin={onAdminLogin} onCleanerLogin={onCleanerLogin} />
        <ChatWidget onBookingComplete={onStartBooking} />
      </div>
    </div>
  );
}