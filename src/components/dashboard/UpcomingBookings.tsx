import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Edit, X, AlertCircle, XCircle, Home, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PaymentModal } from './PaymentModal';
import { parseDateFromDB, formatDisplayDate } from '../../utils/dateUtils';

interface UpcomingBookingsProps {
  onReschedule?: (booking: any) => void;
}

export function UpcomingBookings({ onReschedule }: UpcomingBookingsProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<any | null>(null);
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any | null>(null);
  const [paymentBooking, setPaymentBooking] = useState<any | null>(null);

  const fetchBookings = async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/bookings?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        // Filter for upcoming bookings (today or future)
        const upcoming = data.filter((b: any) => new Date(b.date) >= new Date(new Date().setHours(0, 0, 0, 0)));
        setBookingsList(upcoming);
      } else {
        console.error('Failed to fetch bookings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  // Calculate cancellation fee based on policy
  const calculateCancellationFee = (bookingDate: string, bookingTime: string) => {
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

  const handleCancelClick = (booking: any) => {
    setBookingToCancel(booking);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;

    try {
      const response = await fetch(`http://localhost:4000/api/bookings/${bookingToCancel.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'CANCELLED',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }

      const feePercentage = calculateCancellationFee(bookingToCancel.date, bookingToCancel.time);
      const totalAmount = Number(bookingToCancel.totalAmount);
      const refundAmount = totalAmount * (1 - feePercentage);
      const feeAmount = totalAmount * feePercentage;

      // Refresh list
      fetchBookings();

      // Show success message with refund info
      if (feePercentage === 0) {
        toast.success(`Booking cancelled successfully! Full refund of $${totalAmount.toFixed(2)} will be processed within 5-7 business days.`);
      } else if (feePercentage === 0.5) {
        toast.success(`Booking cancelled. Refund of $${refundAmount.toFixed(2)} will be processed within 5-7 business days. Cancellation fee: $${feeAmount.toFixed(2)}`);
      } else {
        toast.error(`Booking cancelled. No refund available as cancellation was made after the service time.`);
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel booking');
    } finally {
      setCancelModalOpen(false);
      setBookingToCancel(null);
    }
  };

  const CancellationModal = () => {
    if (!bookingToCancel) return null;

    const feePercentage = calculateCancellationFee(bookingToCancel.date, bookingToCancel.time);
    const totalAmount = Number(bookingToCancel.totalAmount);
    const refundAmount = totalAmount * (1 - feePercentage);
    const feeAmount = totalAmount * feePercentage;

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
                  <span>{new Date(bookingToCancel.date).toLocaleDateString('en-US', {
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
                <span className="font-medium text-neutral-900">${totalAmount.toFixed(2)}</span>
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
              <Badge className={`${selectedBookingForDetails.status === 'DRAFT' ? 'bg-orange-600' : selectedBookingForDetails.status === 'BOOKED' ? 'bg-blue-600' : 'bg-green-600'} text-white border-0 text-base px-4 py-2`}>
                {selectedBookingForDetails.status}
              </Badge>
            </div>

            {/* Service Info */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{selectedBookingForDetails.serviceType}</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBookingForDetails && formatDisplayDate(selectedBookingForDetails.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBookingForDetails.time} (±30 min)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBookingForDetails.estimatedDuration || '2-3 hours'}</span>
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
            {selectedBookingForDetails.addOns && selectedBookingForDetails.addOns.length > 0 && (
              <div>
                <h4 className="font-semibold text-neutral-900 mb-3">Add-ons</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedBookingForDetails.addOns.map((addon: any, index: number) => (
                    <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                      {typeof addon === 'string' ? addon : addon.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                <span className="text-3xl font-bold text-neutral-900">${Number(selectedBookingForDetails.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {selectedBookingForDetails.status === 'DRAFT' && (
                <Button
                  className="flex-1 bg-secondary-500 hover:bg-secondary-600"
                  onClick={() => {
                    setPaymentBooking(selectedBookingForDetails);
                    setSelectedBookingForDetails(null);
                  }}
                >
                  Pay Now
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedBookingForDetails(null);
                  onReschedule?.(selectedBookingForDetails);
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

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">Loading bookings...</p>
        </div>
      ) : bookingsList.length === 0 ? (
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
                      <Badge className={`${booking.status === 'DRAFT' ? 'bg-orange-600' : booking.status === 'BOOKED' ? 'bg-blue-600' : 'bg-green-600'} text-white border-0`}>
                        {booking.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-neutral-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDisplayDate(booking.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.time} (±30 min)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{booking.estimatedDuration || '2-3 hours'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">
                      {parseDateFromDB(booking.date).getDate()}
                    </div>
                    <div className="text-xs text-neutral-600 uppercase">
                      {parseDateFromDB(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-neutral-900">${Number(booking.totalAmount).toFixed(2)}</div>
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
                {booking.addOns && booking.addOns.length > 0 && (
                  <div>
                    <div className="font-medium text-neutral-900 mb-2">Add-ons</div>
                    <div className="flex flex-wrap gap-2">
                      {booking.addOns.map((addon: any, index: number) => (
                        <Badge key={index} variant="secondary" className="bg-secondary-100 text-secondary-700">
                          {typeof addon === 'string' ? addon : addon.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t border-neutral-200">
                  {booking.status === 'DRAFT' && (
                    <Button className="flex-1 sm:flex-none bg-secondary-500 hover:bg-secondary-600" onClick={() => setPaymentBooking(booking)}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Pay Now
                    </Button>
                  )}
                  <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onReschedule?.(booking)}>
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
      {paymentBooking && (
        <PaymentModal
          booking={paymentBooking}
          onClose={() => setPaymentBooking(null)}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  );
}