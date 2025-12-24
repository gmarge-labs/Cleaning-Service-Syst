import { Button } from '../../ui/button';
import { BookingData } from '../BookingFlow';
import { CheckCircle2, Calendar, Clock, Download, Mail } from 'lucide-react';
import { Badge } from '../../ui/badge';
import { toast } from 'sonner';
import { useEffect } from 'react';

interface ConfirmationStepProps {
  data: BookingData;
  onComplete: () => void;
  onBookAnother: () => void;
  mode?: 'new' | 'reschedule';
}

export function ConfirmationStep({ data, onComplete, onBookAnother, mode = 'new' }: ConfirmationStepProps) {
  // Use booking ID from data if available, otherwise generate one
  const bookingId = data.id || `BK-${Date.now().toString().slice(-8)}`;
  
  // Show toast notification for reschedule
  useEffect(() => {
    if (mode === 'reschedule') {
      toast.success('Booking Rescheduled Successfully!', {
        description: 'A confirmation email has been sent with your new appointment details.',
        duration: 2000,
      });
    }
  }, [mode]);
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-8 md:p-12 space-y-8">
        {/* Success Icon */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">
            {mode === 'reschedule' ? 'Booking Rescheduled!' : 'Booking Confirmed!'}
          </h1>
          <p className="text-xl text-neutral-600">
            {mode === 'reschedule' 
              ? 'Your cleaning has been successfully rescheduled' 
              : 'Your cleaning has been successfully scheduled'
            }
          </p>
        </div>

        {/* Confirmation Number */}
        <div className="text-center p-4 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
          <p className="text-sm text-neutral-600 mb-1">Booking ID</p>
          <p className="text-2xl font-bold text-secondary-500 tracking-wider">{bookingId}</p>
        </div>

        {/* Free Cleaning Reward Banner */}
        {data.paymentMethod === 'free-cleaning-reward' && (
          <div className="border-2 border-orange-300 bg-gradient-to-r from-orange-50 via-yellow-50 to-orange-50 rounded-xl p-6">
            <div className="text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h3 className="text-2xl font-bold text-orange-900 mb-2">
                Free Cleaning Reward Applied!
              </h3>
              <p className="text-orange-800">
                Congratulations! Your loyalty reward has been applied to this booking.
                <br />
                <strong>No payment required</strong> – this cleaning is on us!
              </p>
            </div>
          </div>
        )}

        {/* Booking Details Card */}
        <div className="border border-neutral-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4">Booking Details</h3>
          
          {/* Service */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xl">✨</span>
            </div>
            <div>
              <div className="text-sm text-neutral-600">Service</div>
              <div className="font-semibold text-neutral-900">{data.serviceType}</div>
              {data.propertyType && (
                <div className="text-sm text-neutral-600">
                  {data.propertyType} • {data.bedrooms} bed • {data.bathrooms} bath
                  {data.rooms && data.rooms.length > 0 && ` • +${data.rooms.length} rooms`}
                </div>
              )}
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-neutral-600">Date & Time</div>
              <div className="font-semibold text-neutral-900">
                {data.date?.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="text-sm text-neutral-600">
                {data.time} (±30 min arrival window)
              </div>
            </div>
          </div>

          {/* Frequency */}
          {data.frequency && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <div className="text-sm text-neutral-600">Frequency</div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-neutral-900">{data.frequency}</span>
                  {data.frequency !== 'One-time' && (
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      Discount Applied
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Add-ons */}
          {data.addOns && data.addOns.length > 0 && (
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">➕</span>
              </div>
              <div>
                <div className="text-sm text-neutral-600 mb-1">Add-ons</div>
                <ul className="space-y-1">
                  {data.addOns.map((addon, index) => (
                    <li key={index} className="text-sm text-neutral-900">
                      • {addon.name}
                      {addon.quantity && addon.quantity > 1 && ` (×${addon.quantity})`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Next Steps */}
        <div className="bg-secondary-50 rounded-xl p-6 space-y-3">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4">What Happens Next?</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                1
              </div>
              <div>
                <div className="font-medium text-neutral-900">Confirmation Email Sent</div>
                <div className="text-sm text-neutral-600">
                  Check your inbox at {data.email} for booking details
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                2
              </div>
              <div>
                <div className="font-medium text-neutral-900">Cleaner Assignment</div>
                <div className="text-sm text-neutral-600">
                  We'll assign a professional cleaner and notify you 24 hours before
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                3
              </div>
              <div>
                <div className="font-medium text-neutral-900">Service Day</div>
                <div className="text-sm text-neutral-600">
                  Your cleaner will arrive during the scheduled window
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary-500 text-white flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                4
              </div>
              <div>
                <div className="font-medium text-neutral-900">
                  {data.paymentMethod === 'free-cleaning-reward' ? 'Enjoy Your Free Cleaning!' : 'Post-Service Payment'}
                </div>
                <div className="text-sm text-neutral-600">
                  {data.paymentMethod === 'free-cleaning-reward' 
                    ? 'No payment required – your free cleaning reward covers everything!'
                    : 'Remaining balance charged automatically after completion'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button
            onClick={onComplete}
            className="w-full bg-secondary-500 hover:bg-secondary-600 py-6 text-lg"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={onBookAnother}
            variant="outline"
            className="w-full py-6 text-lg"
          >
            Book Another Cleaning
          </Button>
        </div>

        {/* Additional Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-neutral-200">
          <button className="flex items-center justify-center gap-2 text-secondary-500 hover:text-secondary-600 font-medium text-sm">
            <Download className="w-4 h-4" />
            Download Receipt
          </button>
          <button className="flex items-center justify-center gap-2 text-secondary-500 hover:text-secondary-600 font-medium text-sm">
            <Calendar className="w-4 h-4" />
            Add to Calendar
          </button>
          <button className="flex items-center justify-center gap-2 text-secondary-500 hover:text-secondary-600 font-medium text-sm">
            <Mail className="w-4 h-4" />
            Email Confirmation
          </button>
        </div>

        {/* Support */}
        <div className="text-center pt-6 border-t border-neutral-200">
          <p className="text-sm text-neutral-600">
            Questions about your booking?{' '}
            <button className="text-secondary-500 hover:underline font-medium">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}