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

export function formatDisplayHours(estimatedHours: number, cleanerCount: number, isAdmin: boolean = false) {
  if (isAdmin || cleanerCount <= 0) {
    return estimatedHours;
  }

  const hoursPerCleaner = estimatedHours / cleanerCount;
  const wholeHours = Math.floor(hoursPerCleaner);
  const minutes = Math.round((hoursPerCleaner - wholeHours) * 60);
  
  if (minutes === 0) {
    return wholeHours;
  } else if (minutes < 30) {
    return wholeHours + 0.5;
  } else {
    return wholeHours + 1.0;
  }
}
