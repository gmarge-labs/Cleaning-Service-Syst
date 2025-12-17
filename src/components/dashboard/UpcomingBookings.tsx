import { useState } from 'react';
import { Calendar, Clock, MapPin, Star, Phone, MessageSquare, Edit, X, AlertCircle, XCircle, Home } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner@2.0.3';

// Mock data
const bookings = [
  {
    id: 1,
    serviceType: 'Deep Cleaning',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    time: '10:00 AM',
    address: '123 Main St, Apt 4B, New York, NY 10001',
    status: 'Confirmed',
    total: 189.00,
    estimatedDuration: '3 hours',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    addOns: ['Inside Windows', 'Pet Hair Removal'],
    frequency: 'Weekly',
  },
  {
    id: 2,
    serviceType: 'Standard Cleaning',
    date: new Date(Date.now() + 12 * 60 * 60 * 1000), // 12 hours from now (within 24 hours)
    time: '2:00 PM',
    address: '123 Main St, Apt 4B, New York, NY 10001',
    status: 'Confirmed',
    total: 120.00,
    estimatedDuration: '2 hours',
    propertyType: 'Apartment',
    bedrooms: 2,
    bathrooms: 1,
    addOns: [],
    frequency: 'One-time',
  },
];

interface UpcomingBookingsProps {
  onReschedule?: () => void;
}

export function UpcomingBookings({ onReschedule }: UpcomingBookingsProps) {
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<typeof bookings[0] | null>(null);
  const [bookingsList, setBookingsList] = useState(bookings);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<typeof bookings[0] | null>(null);

  // Calculate cancellation fee based on policy
  const calculateCancellationFee = (bookingDate: Date, bookingTime: string) => {
    const now = new Date();
    const serviceDateTime = new Date(bookingDate);
    
    // Parse time and set it on the service date
    const [time, period] = bookingTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    if (period === 'PM' && hours !== 12) hour24 += 12;
    if (period === 'AM' && hours === 12) hour24 = 0;
    
    serviceDateTime.setHours(hour24, minutes, 0, 0);
    
    // Calculate hours until service
    const hoursUntilService = (serviceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilService >= 24) {
      return 0; // Free cancellation
    } else if (hoursUntilService > 0) {
      return 0.5; // 50% charge
    } else {
      return 1; // 100% charge (no-show)
    }
  };

  const handleCancelClick = (booking: typeof bookings[0]) => {
    setBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = () => {
    if (!bookingToCancel) return;

    const feePercentage = calculateCancellationFee(bookingToCancel.date, bookingToCancel.time);
    const refundAmount = bookingToCancel.total * (1 - feePercentage);
    const feeAmount = bookingToCancel.total * feePercentage;

    // Remove booking from list
    setBookingsList(bookingsList.filter(b => b.id !== bookingToCancel.id));
    
    // Show success message with refund info
    if (feePercentage === 0) {
      toast.success(`Booking cancelled successfully! Full refund of $${bookingToCancel.total.toFixed(2)} will be processed within 5-7 business days.`);
    } else if (feePercentage === 0.5) {
      toast.success(`Booking cancelled. Refund of $${refundAmount.toFixed(2)} will be processed within 5-7 business days. Cancellation fee: $${feeAmount.toFixed(2)}`);
    } else {
      toast.error(`Booking cancelled. No refund available as cancellation was made after the service time.`);
    }
    
    setCancelModalOpen(false);
    setBookingToCancel(null);
  };

  const CancellationModal = () => {
    if (!bookingToCancel) return null;

    const feePercentage = calculateCancellationFee(bookingToCancel.date, bookingToCancel.time);
    const refundAmount = bookingToCancel.total * (1 - feePercentage);
    const feeAmount = bookingToCancel.total * feePercentage;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => {
          setCancelModalOpen(false);
          setBookingToCancel(null);
        }}
      >
        <div 
          className="bg-white rounded-xl max-w-lg w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-neutral-900">Cancel Booking</h2>
                <p className="text-sm text-neutral-600">Booking ID: #{bookingToCancel.id}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Booking Summary */}
            <div className="bg-neutral-50 rounded-lg p-4">
              <div className="font-semibold text-neutral-900 mb-2">{bookingToCancel.serviceType}</div>
              <div className="text-sm text-neutral-600 space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{bookingToCancel.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{bookingToCancel.time}</span>
                </div>
              </div>
            </div>

            {/* Cancellation Policy Info */}
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <h4 className="font-semibold text-orange-900">Cancellation Policy</h4>
              </div>
              <ul className="text-sm text-orange-800 space-y-1 ml-7">
                <li>• Free cancellation up to 24 hours before service</li>
                <li>• 50% charge for cancellations within 24 hours</li>
                <li>• 100% charge for no-shows</li>
              </ul>
            </div>

            {/* Refund Calculation */}
            <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Original Amount:</span>
                <span className="font-medium text-neutral-900">${bookingToCancel.total.toFixed(2)}</span>
              </div>
              
              {feePercentage > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Cancellation Fee ({(feePercentage * 100).toFixed(0)}%):</span>
                  <span className="font-medium text-red-600">-${feeAmount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="pt-2 border-t border-neutral-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-neutral-900">Refund Amount:</span>
                  <span className={`text-xl font-bold ${feePercentage === 0 ? 'text-green-600' : feePercentage === 1 ? 'text-red-600' : 'text-orange-600'}`}>
                    ${refundAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {feePercentage === 0 && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✓ You're cancelling more than 24 hours in advance. You'll receive a full refund!
                </p>
              </div>
            )}

            {feePercentage === 0.5 && (
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-800">
                  ⚠️ You're cancelling within 24 hours. A 50% cancellation fee will be applied.
                </p>
              </div>
            )}

            {feePercentage === 1 && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ The service time has passed. No refund is available.
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="p-6 border-t border-neutral-200 flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setCancelModalOpen(false);
                setBookingToCancel(null);
              }}
            >
              Keep Booking
            </Button>
            <Button
              className="flex-1 bg-red-600 hover:bg-red-700 text-white"
              onClick={handleConfirmCancel}
            >
              Confirm Cancellation
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const BookingDetailsModal = () => {
    if (!selectedBookingForDetails) return null;

    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedBookingForDetails(null)}
      >
        <div 
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Booking Details</h2>
              <p className="text-sm text-neutral-600">Booking ID: #{selectedBookingForDetails.id}</p>
            </div>
            <button
              onClick={() => setSelectedBookingForDetails(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge className="bg-green-600 text-white border-0 text-base px-4 py-2">
                {selectedBookingForDetails.status}
              </Badge>
            </div>

            {/* Service Info */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{selectedBookingForDetails.serviceType}</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBookingForDetails.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBookingForDetails.time} (±30 min)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBookingForDetails.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBookingForDetails.frequency}</span>
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Home className="w-5 h-5 text-secondary-500" />
                Property Details
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Property Type:</span>
                  <span className="font-medium text-neutral-900">{selectedBookingForDetails.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bedrooms:</span>
                  <span className="font-medium text-neutral-900">{selectedBookingForDetails.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bathrooms:</span>
                  <span className="font-medium text-neutral-900">{selectedBookingForDetails.bathrooms}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-secondary-500" />
                Service Location
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4">
                <p className="text-neutral-700">{selectedBookingForDetails.address}</p>
              </div>
            </div>

            {/* Add-ons */}
            {selectedBookingForDetails.addOns.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Add-ons</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBookingForDetails.addOns.map((addon, index) => (
                    <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                      {addon}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                <span className="text-3xl font-bold text-neutral-900">${selectedBookingForDetails.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setSelectedBookingForDetails(null);
                  onReschedule?.();
                }}
              >
                Reschedule
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setSelectedBookingForDetails(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Upcoming Bookings</h1>
        <p className="text-neutral-600">Manage your scheduled cleaning services</p>
      </div>

      {bookingsList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-xl font-semibold text-neutral-900 mb-2">No Upcoming Bookings</h3>
          <p className="text-neutral-600 mb-6">You don't have any scheduled cleanings yet</p>
          <Button className="bg-secondary-500 hover:bg-secondary-600">Schedule a Cleaning</Button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookingsList.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-secondary-50 to-accent-50 p-6 border-b border-neutral-200">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold text-neutral-900">{booking.serviceType}</h2>
                      <Badge className="bg-green-600 text-white border-0">
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{booking.date.toLocaleDateString('en-US', { 
                          weekday: 'long',
                          month: 'long', 
                          day: 'numeric',
                          year: 'numeric'
                        })}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time} (±30 min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.estimatedDuration}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-neutral-900">${booking.total.toFixed(2)}</div>
                    <div className="text-sm text-neutral-600">Total amount</div>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                {/* Address */}
                <div className="flex items-start gap-3 p-4 bg-neutral-50 rounded-lg">
                  <MapPin className="w-5 h-5 text-secondary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="font-medium text-neutral-900 mb-1">Service Location</div>
                    <div className="text-sm text-neutral-600">{booking.address}</div>
                  </div>
                </div>

                {/* Add-ons */}
                {booking.addOns.length > 0 && (
                  <div>
                    <div className="font-medium text-neutral-900 mb-2">Add-ons</div>
                    <div className="flex flex-wrap gap-2">
                      {booking.addOns.map((addon, index) => (
                        <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                          {addon}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={onReschedule}>
                    <Edit className="w-4 h-4 mr-2" />
                    Reschedule
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setSelectedBookingForDetails(booking)}>
                    View Details
                  </Button>
                  <Button variant="outline" className="flex-1 sm:flex-none text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleCancelClick(booking)}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel Booking
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {cancelModalOpen && <CancellationModal />}
      {selectedBookingForDetails && <BookingDetailsModal />}
    </div>
  );
}