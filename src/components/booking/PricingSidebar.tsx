import { BookingData, SystemSettings } from './BookingFlow';
import { Tag, Clock, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';

interface PricingSidebarProps {
  bookingData: BookingData;
  settings?: SystemSettings | null;
}

const DEFAULT_SERVICE_PRICES: Record<string, number> = {
  'Standard Cleaning': 89,
  'Deep Cleaning': 159,
  'Move In/Out': 199,
  'Post-Construction': 249,
};

const DEFAULT_ROOM_PRICE = 15;

const DEFAULT_FREQUENCY_DISCOUNTS: Record<string, number> = {
  'Weekly': 0.15,
  'Bi-weekly': 0.10,
  'Monthly': 0.05,
};

export function PricingSidebar({ bookingData, settings }: PricingSidebarProps) {
  // Use settings or defaults
  const servicePrices = settings?.servicePrices ?? DEFAULT_SERVICE_PRICES;
  const roomPrices = settings?.roomPrices ?? {};
  
  // Calculate base price
  const basePrice = bookingData.serviceType ? servicePrices[bookingData.serviceType] || 0 : 0;
  
  // Calculate room pricing
  // Bedrooms and Bathrooms use a default or specific price if defined
  const bedroomPrice = roomPrices['Bedroom'] ?? DEFAULT_ROOM_PRICE;
  const bathroomPrice = roomPrices['Bathroom'] ?? DEFAULT_ROOM_PRICE;
  const toiletPrice = roomPrices['Toilet'] ?? 10;

  let roomPrice = (bookingData.bedrooms || 0) * bedroomPrice;
  roomPrice += (bookingData.bathrooms || 0) * bathroomPrice;
  roomPrice += (bookingData.toilets || 0) * toiletPrice;

  // Additional rooms
  if (bookingData.rooms) {
    bookingData.rooms.forEach(roomId => {
      const quantity = bookingData.roomQuantities?.[roomId] || 1;
      // Map roomId to settings key (e.g., 'living-room' -> 'Living Room')
      const settingsKey = roomId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const price = roomPrices[settingsKey] ?? DEFAULT_ROOM_PRICE;
      roomPrice += price * quantity;
    });
  }
  
  const roomCount = (bookingData.bedrooms || 0) + (bookingData.bathrooms || 0) + (bookingData.toilets || 0) + 
    (bookingData.rooms?.reduce((acc, r) => acc + (bookingData.roomQuantities?.[r] || 1), 0) || 0);

  // Calculate add-ons
  const addOnsTotal = bookingData.addOns?.reduce((sum, addon) => {
    const price = settings?.addonPrices?.[addon.name] ?? addon.price;
    return sum + (price * (addon.quantity || 1));
  }, 0) || 0;

  // Add kitchen add-ons if any
  let kitchenAddOnsTotal = 0;
  if (bookingData.kitchenAddOns) {
    Object.values(bookingData.kitchenAddOns).forEach((addons: any) => {
      addons.forEach((addonId: string) => {
        const settingsKey = addonId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
        const price = settings?.addonPrices?.[settingsKey] ?? 20;
        kitchenAddOnsTotal += price;
      });
    });
  }

  // Add laundry details if any
  let laundryTotal = 0;
  if (bookingData.laundryRoomDetails) {
    Object.values(bookingData.laundryRoomDetails).forEach((details: any) => {
      const price = settings?.addonPrices?.['Laundry Service'] ?? 30;
      laundryTotal += price * (details.baskets || 1);
    });
  }
  
  // Calculate subtotal
  const subtotal = basePrice + roomPrice + addOnsTotal + kitchenAddOnsTotal + laundryTotal;
  
  // Calculate discount (Top Booker Discount)
  let discountRate = 0;
  if (settings?.pricing?.topBookerDiscount) {
    // If category is 'all', apply to everyone
    if (settings.pricing.topBookerCategory === 'all') {
      discountRate = settings.pricing.topBookerDiscount / 100;
    }
    // Note: Other categories (10-15, etc.) would require user booking history
    // which is handled on the backend or via user profile data
  }
  
  const discount = subtotal * discountRate;
  
  // Calculate total
  const total = subtotal - discount;
  
  // Calculate estimated duration
  let estimatedHours = 2 + (roomCount * 0.5); // Fallback
  let cleanerCount = 1;

  if (settings?.durationSettings) {
    const ds = settings.durationSettings as any;
    let totalMinutes = ds.baseMinutes || 60;
    
    totalMinutes += (bookingData.bedrooms || 0) * (ds.perBedroom || 30);
    totalMinutes += (bookingData.bathrooms || 0) * (ds.perBathroom || 45);
    totalMinutes += (bookingData.toilets || 0) * (ds.perToilet || 15);
    
    if (bookingData.rooms) {
      bookingData.rooms.forEach(roomId => {
        const quantity = bookingData.roomQuantities?.[roomId] || 1;
        let roomDuration = ds.perOtherRoom || 20;
        
        // Specific room durations
        if (roomId === 'kitchen') roomDuration = ds.perKitchen || 45;
        else if (roomId === 'living-room') roomDuration = ds.perLivingRoom || 30;
        else if (roomId === 'dining-room') roomDuration = ds.perDiningRoom || 20;
        else if (roomId === 'laundry-room') roomDuration = ds.perLaundryRoom || 20;
        else if (roomId === 'balcony') roomDuration = ds.perBalcony || 20;
        else if (roomId === 'basement') roomDuration = ds.perBasement || 45;
        else if (roomId === 'garage') roomDuration = ds.perGarage || 30;
        else if (roomId === 'home-office') roomDuration = ds.perHomeOffice || 20;
        
        totalMinutes += quantity * roomDuration;
      });
    }

    // Kitchen Add-ons Duration
    if (bookingData.kitchenAddOns) {
      Object.values(bookingData.kitchenAddOns).forEach((addons: any) => {
        addons.forEach((addonId: string) => {
          let addonDuration = 0;
          if (addonId === 'inside-fridge') addonDuration = ds.perInsideFridge || 20;
          else if (addonId === 'inside-oven') addonDuration = ds.perInsideOven || 25;
          else if (addonId === 'microwave') addonDuration = ds.perMicrowave || 10;
          else if (addonId === 'dishes') addonDuration = ds.perDishes || 20;
          totalMinutes += addonDuration;
        });
      });
    }

    // Laundry Details Duration
    if (bookingData.laundryRoomDetails) {
      Object.values(bookingData.laundryRoomDetails).forEach((details: any) => {
        const basketDuration = ds.perLaundryBasket || 30;
        totalMinutes += (details.baskets || 1) * basketDuration;
      });
    }

    // General Add-ons Duration
    if (bookingData.addOns) {
      bookingData.addOns.forEach(addon => {
        let addonDuration = 0;
        const quantity = addon.quantity || 1;
        
        // Map addon names/ids to duration settings
        if (addon.name === 'Inside Windows') addonDuration = ds.perWindow || 15;
        else if (addon.name === 'Pet Hair Removal') addonDuration = ds.perPetHair || 30;
        else if (addon.name === 'Organization') addonDuration = ds.perOrganizationHour || 60;
        
        totalMinutes += addonDuration * quantity;
      });
    }

    let multiplier = 1.0;
    if (bookingData.serviceType === 'Deep Cleaning') multiplier = ds.deepCleaningMultiplier || 1.5;
    else if (bookingData.serviceType === 'Move In/Out') multiplier = ds.moveInOutMultiplier || 2.0;
    else if (bookingData.serviceType === 'Post-Construction') multiplier = ds.postConstructionMultiplier || 2.5;
    else multiplier = ds.standardCleaningMultiplier || 1.0;

    const totalMins = Math.round(totalMinutes * multiplier);
    estimatedHours = Number((totalMins / 60).toFixed(1));
    cleanerCount = Math.ceil(totalMins / 240);
    if (cleanerCount < 1) cleanerCount = 1;
  }

  return (
    <div className="sticky top-28">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-lg p-6 space-y-6">
        <h3 className="font-semibold text-xl text-neutral-900">Booking Summary</h3>

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
        {discount > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-700">
              <Tag className="w-3 h-3 mr-1" />
              Top Booker Discount ({(discountRate * 100).toFixed(0)}% off)
            </Badge>
          </div>
        )}

        {/* Pricing Breakdown */}
        <div className="border-t border-neutral-200 pt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-neutral-600">Subtotal</span>
            <span className="text-neutral-900 font-medium">${subtotal.toFixed(2)}</span>
          </div>
          
          {discount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-green-600">Top Booker Discount</span>
              <span className="text-green-600 font-medium">-${discount.toFixed(2)}</span>
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