import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from './store/store';
import { logout } from './store/slices/authSlice';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { PricingPage } from './pages/PricingPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ContactPage } from './pages/ContactPage';
import { CareersPage } from './pages/CareersPage';
import { ApplicationFormPage } from './pages/ApplicationFormPage';
import { CustomerDashboard } from './components/dashboard/CustomerDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { SupervisorDashboard } from './components/supervisor/SupervisorDashboard';
import { SupportDashboard } from './components/support/SupportDashboard';
import { BookingFlow } from './components/booking/BookingFlow';
import { CleanerApp } from './components/cleaner/CleanerApp';

type View = 'landing' | 'booking' | 'dashboard' | 'admin' | 'supervisor' | 'support' | 'cleaner';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('landing');
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const userRole = user?.role?.toLowerCase() as 'customer' | 'admin' | 'supervisor' | 'support' | null;
  const dispatch = useDispatch();

  const [bookingInitialStep, setBookingInitialStep] = useState(0); // Track initial step for booking flow
  const [bookingMode, setBookingMode] = useState<'new' | 'reschedule'>('new'); // Track booking mode

  const handleStartBooking = () => {
    setBookingInitialStep(0); // Start from beginning
    setBookingMode('new');
    setCurrentView('booking');
  };

  const handleRescheduleBooking = () => {
    // For reschedule mode: only show Schedule and Confirmation steps
    setBookingInitialStep(0); // Start at first step of reschedule flow
    setBookingMode('reschedule');
    setCurrentView('booking');
  };

  const handleNavigate = (view: View) => {
    setCurrentView(view);
  };

  const handleLogin = () => {
    setCurrentView('dashboard');
  };

  const handleAdminLogin = () => {
    setCurrentView('admin');
  };

  const handleSupervisorLogin = () => {
    setCurrentView('supervisor');
  };

  const handleSupportLogin = () => {
    setCurrentView('support');
  };

  const handleCleanerLogin = () => {
    setCurrentView('cleaner');
  };

  const handleLogout = () => {
    dispatch(logout());
    setCurrentView('landing');
  };

  const handleBookingComplete = () => {
    setCurrentView('dashboard');
  };

  const handleBookingCancel = () => {
    setCurrentView('landing');
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" richColors expand={false} />
      <div className="min-h-screen bg-neutral-50">
        {currentView === 'landing' ? (
          <Layout
            onStartBooking={handleStartBooking}
            onLogin={handleLogin}
            isAuthenticated={isAuthenticated}
            onNavigateToDashboard={() => handleNavigate('dashboard')}
            onAdminLogin={handleAdminLogin}
            onSupervisorLogin={handleSupervisorLogin}
            onSupportLogin={handleSupportLogin}
            onCleanerLogin={handleCleanerLogin}
          >
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage
                    onStartBooking={handleStartBooking}
                    onCleanerLogin={handleCleanerLogin}
                  />
                }
              />
              <Route
                path="/services"
                element={
                  <ServicesPage
                    onGetQuote={handleStartBooking}
                  />
                }
              />
              <Route
                path="/pricing"
                element={
                  <PricingPage
                    onGetQuote={handleStartBooking}
                  />
                }
              />
              <Route
                path="/how-it-works"
                element={
                  <HowItWorksPage
                    onGetStarted={handleStartBooking}
                  />
                }
              />
              <Route
                path="/contact"
                element={
                  <ContactPage
                    onStartChat={handleStartBooking}
                  />
                }
              />
              <Route
                path="/careers"
                element={<CareersPage />}
              />
              <Route
                path="/apply"
                element={<ApplicationFormPage />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        ) : currentView === 'admin' ? (
          <AdminDashboard
            onLogout={handleLogout}
          />
        ) : currentView === 'supervisor' ? (
          <SupervisorDashboard
            onLogout={handleLogout}
          />
        ) : currentView === 'support' ? (
          <SupportDashboard
            onLogout={handleLogout}
          />
        ) : currentView === 'dashboard' ? (
          <CustomerDashboard
            onNavigateHome={handleLogout}
            onStartBooking={handleStartBooking}
            onRescheduleBooking={handleRescheduleBooking}
            onLogout={handleLogout}
          />
        ) : currentView === 'booking' ? (
          <BookingFlow
            onComplete={handleBookingComplete}
            onCancel={handleBookingCancel}
            isAuthenticated={isAuthenticated}
            initialStep={bookingInitialStep}
            mode={bookingMode}
          />
        ) : currentView === 'cleaner' ? (
          <CleanerApp
            onBack={handleLogout}
          />
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">View: {currentView}</h1>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-secondary-500 text-white rounded-lg"
              >
                Back to Landing
              </button>
            </div>
          </div>
        )}
      </div>
    </BrowserRouter>
  );
}