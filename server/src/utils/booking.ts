import prisma from './prisma';

export async function calculateBookingDuration(bookingData: any) {
  let estimatedDuration = 0;
  let cleanerCount = 1;

  try {
    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
    if (settings && settings.durationSettings) {
      const ds = settings.durationSettings as any;

      // Base time
      let totalMinutes = ds.baseMinutes || 60;

      // Room times
      totalMinutes += (bookingData.bedrooms || 0) * (ds.perBedroom || 30);
      totalMinutes += (bookingData.bathrooms || 0) * (ds.perBathroom || 45);
      totalMinutes += (bookingData.toilets || 0) * (ds.perToilet || 15);

      // Other rooms
      if (bookingData.rooms && Array.isArray(bookingData.rooms)) {
        bookingData.rooms.forEach((roomId: string) => {
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
      if (bookingData.addOns && Array.isArray(bookingData.addOns)) {
        bookingData.addOns.forEach((addon: any) => {
          let addonDuration = 0;
          const quantity = addon.quantity || 1;
          
          // Map addon names/ids to duration settings
          if (addon.name === 'Inside Windows') addonDuration = ds.perWindow || 15;
          else if (addon.name === 'Pet Hair Removal') addonDuration = ds.perPetHair || 30;
          else if (addon.name === 'Organization') addonDuration = ds.perOrganizationHour || 60;
          
          totalMinutes += addonDuration * quantity;
        });
      }

      // Service Multiplier
      let multiplier = 1.0;
      if (bookingData.serviceType === 'Deep Cleaning') multiplier = ds.deepCleaningMultiplier || 1.5;
      else if (bookingData.serviceType === 'Move In/Out') multiplier = ds.moveInOutMultiplier || 2.0;
      else if (bookingData.serviceType === 'Post-Construction') multiplier = ds.postConstructionMultiplier || 2.5;
      else multiplier = ds.standardCleaningMultiplier || 1.0;

      estimatedDuration = Math.round(totalMinutes * multiplier);

      // Cleaner count: 1 cleaner per 4 hours (240 mins)
      cleanerCount = Math.ceil(estimatedDuration / 240);
      if (cleanerCount < 1) cleanerCount = 1;
    } else {
      // Fallback to basic calculation if settings fail
      estimatedDuration = 120 + ((bookingData.bedrooms || 0) + (bookingData.bathrooms || 0)) * 30;
      cleanerCount = Math.ceil(estimatedDuration / 240);
    }
  } catch (err) {
    console.error('Error calculating duration:', err);
    estimatedDuration = 120 + ((bookingData.bedrooms || 0) + (bookingData.bathrooms || 0)) * 30;
    cleanerCount = Math.ceil(estimatedDuration / 240);
  }

  return { estimatedDuration, cleanerCount };
}
