import { Calendar, Star, TrendingUp, Clock, Home, X, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PaymentModal } from './PaymentModal';
import { parseDateFromDB, formatDisplayDate } from '../../utils/dateUtils';

interface DashboardOverviewProps {
  onStartBooking: () => void;
  onRescheduleBooking?: (booking: any) => void;
}

// Mock data - Track completed cleanings for free cleaning rewards
const COMPLETED_CLEANINGS = 3; // User has completed 3 cleanings
const FREE_CLEANING_THRESHOLD = 5; // Free cleaning after 5 cleanings

export function DashboardOverview({ onStartBooking, onRescheduleBooking }: DashboardOverviewProps) {
  const user = useSelector((state: RootState) => state.auth.user);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [paymentBooking, setPaymentBooking] = useState<any | null>(null);

  const fetchBookings = async () => {
    if (!user?.id) {
      setIsLoadingBookings(false);
      return;
    }

    try {
      const response = await fetch(`/api/bookings?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      } else {
        console.error('Failed to fetch bookings:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setIsLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user?.id]);

  const upcomingBookings = bookings.filter(b => new Date(b.date) >= new Date());

  const stats = [
    {
      label: 'Upcoming Bookings',
      value: upcomingBookings.length.toString(),
      icon: Calendar,
      color: 'from-secondary-500 to-secondary-600',
      bgColor: 'bg-secondary-50',
      textColor: 'text-secondary-500',
    },
    {
      label: 'Completed Cleanings',
      value: '12', // Mock value for now
      icon: Star,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      label: 'Free Cleaning Progress',
      value: `${COMPLETED_CLEANINGS}/${FREE_CLEANING_THRESHOLD}`,
      icon: TrendingUp,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      isProgress: true,
      progress: (COMPLETED_CLEANINGS / FREE_CLEANING_THRESHOLD) * 100,
    },
  ];

  const BookingDetailsModal = () => {
    if (!selectedBooking) return null;

    return (
      <div
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={() => setSelectedBooking(null)}
      >
        <div
          className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-neutral-200 p-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">Booking Details</h2>
              <p className="text-sm text-neutral-600">Booking ID: #{selectedBooking.id}</p>
            </div>
            <button
              onClick={() => setSelectedBooking(null)}
              className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex items-center gap-3">
              <Badge className={`${selectedBooking.status === 'DRAFT' ? 'bg-orange-600' : selectedBooking.status === 'BOOKED' ? 'bg-blue-600' : 'bg-green-600'} text-white border-0 text-base px-4 py-2`}>
                {selectedBooking.status}
              </Badge>
            </div>

            {/* Service Info */}
            <div className="bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-neutral-900 mb-2">{selectedBooking.serviceType}</h3>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBooking && formatDisplayDate(selectedBooking.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Clock className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBooking.time} (±30 min)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Home className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBooking.propertyType}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-700">
                  <Calendar className="w-4 h-4 text-secondary-500" />
                  <span>{selectedBooking.frequency || 'One-time'}</span>
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
                  <span className="font-medium text-neutral-900">{selectedBooking.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bedrooms:</span>
                  <span className="font-medium text-neutral-900">{selectedBooking.bedrooms}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Bathrooms:</span>
                  <span className="font-medium text-neutral-900">{selectedBooking.bathrooms}</span>
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div>
              <h4 className="font-semibold text-neutral-900 mb-3 flex items-center gap-2">
                <Star className="w-5 h-5 text-secondary-500" />
                Contact & Location
              </h4>
              <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Name:</span>
                  <span className="font-medium text-neutral-900">{selectedBooking.guestName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Email:</span>
                  <span className="font-medium text-neutral-900">{selectedBooking.guestEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Phone:</span>
                  <span className="font-medium text-neutral-900">{selectedBooking.guestPhone || 'N/A'}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-neutral-600">Address:</span>
                  <span className="font-medium text-neutral-900">{selectedBooking.address || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="border-t border-neutral-200 pt-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-900">Total Amount</span>
                <span className="text-3xl font-bold text-neutral-900">${Number(selectedBooking.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {selectedBooking.status === 'DRAFT' && (
                <Button
                  className="flex-1 bg-secondary-500 hover:bg-secondary-600"
                  onClick={() => {
                    setPaymentBooking(selectedBooking);
                    setSelectedBooking(null);
                  }}
                >
                  Pay Now
                </Button>
              )}
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setSelectedBooking(null);
                  onRescheduleBooking?.(selectedBooking);
                }}
              >
                Reschedule
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setSelectedBooking(null)}
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
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name.split(' ')[0] || 'Customer'}! 👋</h1>
            <p className="text-secondary-100">
              {upcomingBookings.length > 0
                ? `Your next cleaning is scheduled for ${parseDateFromDB(upcomingBookings[0].date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric'
                })}`
                : "You don't have any upcoming cleanings scheduled."
              }
            </p>
          </div>
          <Button
            onClick={onStartBooking}
            className="bg-white text-secondary-500 hover:bg-secondary-50"
          >
            Book Another Cleaning
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-xl border border-neutral-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="text-3xl font-bold text-neutral-900 mb-1">{stat.value}</div>
              <div className="text-sm text-neutral-600 mb-3">{stat.label}</div>

              {/* Progress Bar for Free Cleaning */}
              {stat.isProgress && (
                <div className="space-y-2">
                  <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color} transition-all duration-500`}
                      style={{ width: `${stat.progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-neutral-500">
                    {COMPLETED_CLEANINGS >= FREE_CLEANING_THRESHOLD
                      ? '🎉 Free cleaning unlocked! Apply at checkout'
                      : `${FREE_CLEANING_THRESHOLD - COMPLETED_CLEANINGS} more cleaning${FREE_CLEANING_THRESHOLD - COMPLETED_CLEANINGS === 1 ? '' : 's'} to earn a free one!`
                    }
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Upcoming Bookings Preview */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-neutral-900">Your Next Cleanings</h2>
          <Button variant="ghost" className="text-secondary-500">View All</Button>
        </div>

        <div className="space-y-4">
          {isLoadingBookings ? (
            <div className="text-center py-8">
              <p className="text-neutral-500">Loading bookings...</p>
            </div>
          ) : upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col md:flex-row gap-4 p-5 border border-neutral-200 rounded-xl hover:border-secondary-300 hover:shadow-md transition-all group"
              >
                {/* Service Info */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-secondary-100 flex items-center justify-center text-xl">
                    ✨
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-900">{booking.serviceType}</h3>
                    <div className="text-sm text-neutral-600 flex items-center gap-2">
                      <Badge variant="secondary" className={`text-[10px] px-1.5 py-0 h-4 ${booking.status === 'DRAFT' ? 'bg-orange-100 text-orange-700' :
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          booking.status === 'BOOKED' ? 'bg-blue-100 text-blue-700' :
                            'bg-green-100 text-green-700'
                        }`}>
                        {booking.status}
                      </Badge>
                      <span>booking</span>
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-neutral-900">
                      {parseDateFromDB(booking.date).getDate()}
                    </div>
                    <div className="text-xs text-neutral-600 uppercase">
                      {parseDateFromDB(booking.date).toLocaleDateString('en-US', { month: 'short' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-neutral-600">at {booking.time}</div>
                    <div className="text-sm text-neutral-600">{booking.propertyType}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {booking.status === 'DRAFT' && (
                    <Button
                      size="sm"
                      className="bg-secondary-500 hover:bg-secondary-600"
                      onClick={() => setPaymentBooking(booking)}
                    >
                      Pay Now
                    </Button>
                  )}
                  <Button variant="outline" size="sm" onClick={() => setSelectedBooking(booking)}>View Details</Button>
                  <Button variant="ghost" size="icon" className="text-neutral-400 group-hover:text-secondary-500">
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-neutral-500">No upcoming bookings found.</p>
              <Button variant="link" className="text-secondary-500 mt-2" onClick={onStartBooking}>Book a cleaning now</Button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <button className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-secondary-300 hover:shadow-lg transition-all text-left">
          <div className="text-3xl mb-3">📅</div>
          <h3 className="font-semibold text-neutral-900 mb-1">Manage Schedule</h3>
          <p className="text-sm text-neutral-600">View and modify your bookings</p>
        </button>

        <button className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-secondary-300 hover:shadow-lg transition-all text-left">
          <div className="text-3xl mb-3">💳</div>
          <h3 className="font-semibold text-neutral-900 mb-1">Payment Methods</h3>
          <p className="text-sm text-neutral-600">Update your payment information</p>
        </button>

        <button className="bg-white rounded-xl border border-neutral-200 p-6 hover:border-secondary-300 hover:shadow-lg transition-all text-left">
          <div className="text-3xl mb-3">🎁</div>
          <h3 className="font-semibold text-neutral-900 mb-1">Rewards & Referrals</h3>
          <p className="text-sm text-neutral-600">Earn points and share with friends</p>
        </button>
      </div>

      {/* Modals */}
      {selectedBooking && <BookingDetailsModal />}
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