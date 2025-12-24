import { useState, useEffect } from 'react';
import { AccountStep } from './steps/AccountStep';
import { ServiceStep } from './steps/ServiceStep';
import { PropertyDetailsStep } from './steps/PropertyDetailsStep';
import { AddOnsStep } from './steps/AddOnsStep';
import { SchedulingStep } from './steps/SchedulingStep';
import { PaymentStep } from './steps/PaymentStep';
import { ConfirmationStep } from './steps/ConfirmationStep';
import { ProgressIndicator } from './ProgressIndicator';
import { PricingSidebar } from './PricingSidebar';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { parseDateFromDB } from '../../utils/dateUtils';

const API_URL = '/api';

export interface BookingData {
  id?: string;
  // Account
  accountType?: 'create' | 'login' | 'guest';
  name?: string;
  email?: string;
  phone?: string;
  address?: string;

  // Service
  serviceType?: string;

  // Property Details
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  toilets?: number;
  rooms?: string[];
  roomQuantities?: Record<string, number>;
  kitchenAddOns?: Record<number, string[]>; // Kitchen index -> array of add-on IDs
  laundryRoomDetails?: Record<number, { baskets: number; rounds: number }>; // Laundry room index -> baskets & rounds

  // Add-ons
  addOns?: Array<{ id: string; name: string; price: number; quantity?: number }>;

  // Scheduling
  date?: Date;
  time?: string;
  frequency?: string;
  specialInstructions?: string;
  hasPet?: boolean;
  selectedPets?: string[];
  customPets?: string[];
  petPresent?: boolean;
  petDetails?: any;

  // Payment
  paymentMethod?: string;
  tipAmount?: number;
  totalAmount?: number;
}

export interface SystemSettings {
  general: any;
  pricing: {
    depositPercentage: number;
    topBookerDiscount: number;
    topBookerCategory: string;
    cancellationFee: number;
  };
  servicePrices: Record<string, number>;
  roomPrices: Record<string, number>;
  addonPrices: Record<string, number>;
  durationSettings?: any;
  notifications: any;
  integrations: any;
}

interface BookingFlowProps {
  onComplete: () => void;
  onCancel: () => void;
  isAuthenticated?: boolean;
  initialStep?: number; // Allow starting at a specific step (for rescheduling)
  mode?: 'new' | 'reschedule'; // Track if this is a new booking or reschedule
  rescheduleBooking?: any; // The booking being rescheduled
}

const STEPS = [
  'Account',
  'Service',
  'Details',
  'Add-ons',
  'Schedule',
  'Payment',
  'Confirmation',
];

const STEPS_WITHOUT_ACCOUNT = [
  'Service',
  'Details',
  'Add-ons',
  'Schedule',
  'Payment',
  'Confirmation',
];

const RESCHEDULE_STEPS = [
  'Schedule',
  'Confirmation',
];

export function BookingFlow({ onComplete, onCancel, isAuthenticated = false, initialStep = 0, mode = 'new', rescheduleBooking }: BookingFlowProps) {
  // Determine which steps to show based on mode
  let steps;
  if (mode === 'reschedule') {
    steps = RESCHEDULE_STEPS;
  } else {
    steps = isAuthenticated ? STEPS_WITHOUT_ACCOUNT : STEPS;
  }

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [bookingData, setBookingData] = useState<BookingData>(
    mode === 'reschedule' && rescheduleBooking ? {
      ...rescheduleBooking,
      date: parseDateFromDB(rescheduleBooking.date),
    } : {}
  );

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateBookingData = (data: Partial<BookingData>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-8 h-8 text-secondary-500 animate-spin" />
        <p className="text-neutral-600">Preparing your booking experience...</p>
      </div>
    );
  }

  const renderStep = () => {
    const currentStepName = steps[currentStep];

    switch (currentStepName) {
      case 'Account':
        return <AccountStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} />;
      case 'Service':
        return <ServiceStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={currentStep > 0 ? prevStep : undefined} settings={settings} />;
      case 'Details':
        return <PropertyDetailsStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} />;
      case 'Add-ons':
        return <AddOnsStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} settings={settings} />;
      case 'Schedule':
        return <SchedulingStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={mode === 'reschedule' ? undefined : prevStep} mode={mode} />;
      case 'Payment':
        return <PaymentStep data={bookingData} onUpdate={updateBookingData} onNext={nextStep} onBack={prevStep} />;
      case 'Confirmation':
        return <ConfirmationStep data={bookingData} onComplete={onComplete} mode={mode} onBookAnother={() => {
          setCurrentStep(0);
          setBookingData({});
        }} />;
      default:
        return null;
    }
  };

  const totalSteps = steps.length - 1; // Exclude confirmation step from count

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <span className="text-white font-bold text-xl">S</span>
              </div>
              <div>
                <h1 className="font-bold text-xl text-neutral-900">
                  {mode === 'reschedule' ? 'Reschedule Your Cleaning' : 'Book Your Cleaning'}
                </h1>
                {currentStep < totalSteps && (
                  <p className="text-sm text-neutral-600">Step {currentStep + 1} of {totalSteps}</p>
                )}
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-neutral-600" />
            </button>
          </div>
        </div>

        {currentStep < totalSteps && (
          <ProgressIndicator currentStep={currentStep} steps={steps.slice(0, totalSteps)} />
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step Content */}
          <div className="lg:col-span-2">
            {renderStep()}
          </div>

          {/* Pricing Sidebar - Show after first step and before confirmation */}
          {currentStep > 0 && currentStep < totalSteps && (
            <div className="lg:col-span-1">
              <PricingSidebar bookingData={bookingData} settings={settings} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}