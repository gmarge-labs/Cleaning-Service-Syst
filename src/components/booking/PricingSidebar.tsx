import { BookingData, SystemSettings } from './BookingFlow';
import { Tag, Clock, Calendar, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { calculateBookingDuration, formatDisplayHours, calculateBookingPrice } from '../../utils/bookingUtils';

interface PricingSidebarProps {
  bookingData: BookingData;
  settings?: SystemSettings | null;
  isAdmin?: boolean;
}

export function PricingSidebar({ bookingData, settings, isAdmin = false }: PricingSidebarProps) {
  const { 
    basePrice,
    roomPrice,
    subtotal, 
    frequencyDiscount, 
    frequencyDiscountRate,
    topBookerDiscount, 
    topBookerDiscountRate,
    total 
  } = calculateBookingPrice(bookingData, settings);

  const roomCount = (bookingData.bedrooms || 0) + (bookingData.bathrooms || 0) + (bookingData.toilets || 0) + 
    (bookingData.rooms?.reduce((acc, r) => acc + (bookingData.roomQuantities?.[r] || 1), 0) || 0);
  
  // Calculate estimated duration and cleaner count
  const { estimatedHours, cleanerCount } = calculateBookingDuration(bookingData, settings);

  return (
    <div className="sticky top-28">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl text-neutral-900">Booking Summary</h3>
        </div>

        {/* Duration and Cleaners - Only visible to Admin during booking flow */}
        {isAdmin && (
          <div className="flex items-center gap-4 py-3 border-y border-neutral-100">
            <div className="flex items-center gap-2 text-neutral-700">
              <Clock className="w-4 h-4 text-secondary-500" />
              <span className="text-sm font-medium">
                {estimatedHours} {estimatedHours === 1 ? 'hour' : 'hours'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Users className="w-4 h-4 text-secondary-500" />
              <span className="text-sm font-medium">
                {cleanerCount} {cleanerCount === 1 ? 'cleaner' : 'cleaners'}
              </span>
            </div>
          </div>
        )}

        {/* Service Details */}
        {bookingData.serviceType && (
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium text-neutral-900">{bookingData.serviceType}</div>
                {roomCount > 0 && (
                  <div className="text-sm text-neutral-600">{roomCount} rooms</div>
                )}
              </div>
              <div className="text-right">
                <div className="font-semibold text-neutral-900">${(basePrice + roomPrice).toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}

        {/* Add-ons */}
        {bookingData.addOns && bookingData.addOns.length > 0 && (
          <div className="border-t border-neutral-200 pt-4 space-y-3">
            <div className="font-medium text-neutral-900 text-sm">Add-ons</div>
            {bookingData.addOns.map((addon, index) => (
              <div key={index} className="flex justify-between text-sm">
                <div className="text-neutral-600">
                  {addon.name}
                  {addon.quantity && addon.quantity > 1 && ` (×${addon.quantity})`}
                </div>
                <div className="text-neutral-900 font-medium">
                  ${(addon.price * (addon.quantity || 1)).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scheduling Info */}
        {bookingData.date && (
          <div className="border-t border-neutral-200 pt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-neutral-600" />
              <span className="text-neutral-900">
                {bookingData.date.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
            {bookingData.time && (
              <div className="text-sm text-neutral-600 ml-6">{bookingData.time}</div>
            )}
          </div>
        )}

        {/* Discount Badge */}
        {(topBookerDiscount > 0 || frequencyDiscount > 0) && (
          <div className="flex flex-col gap-2">
            {frequencyDiscount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  <Tag className="w-3 h-3 mr-1" />
                  {bookingData.frequency} Discount ({(frequencyDiscountRate * 100).toFixed(0)}% off)
                </Badge>
              </div>
            )}
            {topBookerDiscount > 0 && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  <Tag className="w-3 h-3 mr-1" />
                  Top Booker Discount ({(topBookerDiscountRate * 100).toFixed(0)}% off)
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="border-t border-neutral-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="text-neutral-900 font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          {frequencyDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">{bookingData.frequency} Discount</span>
              <span className="text-blue-600 font-medium">-${frequencyDiscount.toFixed(2)}</span>
            </div>
          )}

          {topBookerDiscount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Top Booker Discount</span>
              <span className="text-green-600 font-medium">-${topBookerDiscount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between pt-3 border-t border-neutral-200">
            <span className="font-semibold text-neutral-900">Total</span>
            <span className="font-bold text-2xl text-neutral-900">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="text-sm text-blue-900">
              <p className="font-semibold mb-1">Payment Due at Booking</p>
              <p>Full payment of <span className="font-bold">${total.toFixed(2)}</span> will be charged immediately upon booking confirmation.</p>
            </div>
          </div>
        </div>

        {/* Guarantee Badge */}
        <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-secondary-50 to-accent-50 rounded-lg">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
            <span className="text-2xl">✓</span>
          </div>
          <div>
            <div className="text-sm font-semibold text-neutral-900">100% Satisfaction Guaranteed</div>
            <div className="text-xs text-neutral-600">Or your money back</div>
          </div>
        </div>
      </div>
    </div>
  );
}