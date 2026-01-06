import { ReactNode } from 'react';
import { Header } from '../landing/Header';
import { Footer } from '../landing/Footer';
import { ChatWidget } from '../chatbot/ChatWidget';
import { ScrollToTop } from './ScrollToTop';

interface LayoutProps {
  children: ReactNode;
  onStartBooking: () => void;
  onLogin: () => void;
  isAuthenticated: boolean;
  onNavigateToDashboard: () => void;
  onAdminLogin?: () => void;
  onSupervisorLogin?: () => void;
  onSupportLogin?: () => void;
  onCleanerLogin?: () => void;
}

export function Layout({ 
  children, 
  onStartBooking,
  onLogin,
  isAuthenticated,
  onNavigateToDashboard,
  onAdminLogin,
  onSupervisorLogin,
  onSupportLogin,
  onCleanerLogin
}: LayoutProps) {
  return (
    <div className="min-h-screen">
      <ScrollToTop />
      <Header 
        onStartBooking={onStartBooking}
        onLogin={onLogin}
        isAuthenticated={isAuthenticated}
        onNavigateToDashboard={onNavigateToDashboard}
        onAdminLogin={onAdminLogin}
        onSupervisorLogin={onSupervisorLogin}
        onSupportLogin={onSupportLogin}
      />
      <div className="pt-0">
        {children}
      </div>
      <Footer onAdminLogin={onAdminLogin} onCleanerLogin={onCleanerLogin} />
      <ChatWidget onBookingComplete={onStartBooking} />
    </div>
  );
}
