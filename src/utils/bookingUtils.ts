import { BookingData, SystemSettings } from '../components/booking/BookingFlow';

export function calculateBookingDuration(bookingData: BookingData, settings?: SystemSettings | null) {
  const roomCount = (bookingData.bedrooms || 0) + (bookingData.bathrooms || 0) + (bookingData.toilets || 0) + 
    (bookingData.rooms?.reduce((acc, r) => acc + (bookingData.roomQuantities?.[r] || 1), 0) || 0);

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
    
    // Cleaner count: 1 cleaner per 4 hours (240 mins)
    cleanerCount = Math.ceil(totalMins / 240);
    if (cleanerCount < 1) cleanerCount = 1;
  }

  return { estimatedHours, cleanerCount };
}

export function calculateBookingPrice(bookingData: BookingData, settings?: SystemSettings | null, userBookingCount: number = 0) {
  const DEFAULT_SERVICE_PRICES: Record<string, number> = {
    'Standard Cleaning': 89,
    'Deep Cleaning': 159,
    'Move In/Out': 199,
    'Post-Construction': 249,
  };

  const DEFAULT_ROOM_PRICE = 15;

  const FREQUENCY_DISCOUNTS: Record<string, number> = {
    'One-time': 0,
    'Weekly': 0.15,
    'Bi-weekly': 0.10,
    'Monthly': 0.05,
  };

  // Use settings or defaults
  const servicePrices = settings?.servicePrices ?? DEFAULT_SERVICE_PRICES;
  const roomPrices = settings?.roomPrices ?? {};
  
  // Calculate base price
  const basePrice = bookingData.serviceType ? servicePrices[bookingData.serviceType] || 0 : 0;
  
  // Calculate room pricing
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
      const settingsKey = roomId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      const price = roomPrices[settingsKey] ?? DEFAULT_ROOM_PRICE;
      roomPrice += price * quantity;
    });
  }
  
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
  
  // Calculate frequency discount
  const frequency = bookingData.frequency || 'One-time';
  const frequencyDiscountRate = FREQUENCY_DISCOUNTS[frequency] || 0;
  const frequencyDiscount = subtotal * frequencyDiscountRate;

  // Calculate top booker discount
  let topBookerDiscountRate = 0;
  if (settings?.pricing?.topBookerEnabled && settings.pricing.topBookerDiscount && userBookingCount > 0) {
    const category = settings.pricing.topBookerCategory;
    
    // Check if user qualifies for this category
    let qualifies = false;
    if (category === 'all') {
      qualifies = true;
    } else if (category === '5-9') {
      qualifies = userBookingCount >= 5 && userBookingCount <= 9;
    } else if (category === '10-15') {
      qualifies = userBookingCount >= 10 && userBookingCount <= 15;
    } else if (category === '16-20') {
      qualifies = userBookingCount >= 16 && userBookingCount <= 20;
    } else if (category === '21+') {
      qualifies = userBookingCount >= 21;
    }
    
    if (qualifies) {
      topBookerDiscountRate = settings.pricing.topBookerDiscount / 100;
    }
  }
  
  const topBookerDiscount = (subtotal - frequencyDiscount) * topBookerDiscountRate;
  const total = subtotal - frequencyDiscount - topBookerDiscount;

  return { 
    basePrice,
    roomPrice,
    addOnsTotal,
    kitchenAddOnsTotal,
    laundryTotal,
    subtotal, 
    frequencyDiscount, 
    frequencyDiscountRate,
    topBookerDiscount, 
    topBookerDiscountRate,
    total 
  };
}

export function formatDisplayHours(estimatedHours: number, cleanerCount: number, isAdmin: boolean = false) {
  if (isAdmin || cleanerCount <= 0) {
    return estimatedHours;
  }

  // Calculate hours per cleaner (each cleaner can handle up to 4 hours)
  const hoursPerCleaner = estimatedHours / cleanerCount;
  
  // Round to nearest 0.5 hour
  // 0-0.24 rounds to 0, 0.25-0.74 rounds to 0.5, 0.75+ rounds to next whole number
  const roundedHours = Math.round(hoursPerCleaner * 2) / 2;
  
  return roundedHours;
}
