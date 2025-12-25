import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification, notifyAdmins, notifyCleaners } from '../utils/notification';
import { sendBookingConfirmation, sendInvoiceEmail } from '../utils/email.service';

const prisma = new PrismaClient();

export const sendInvoice = async (req: Request, res: Response) => {
  try {
    const { bookingId, email, total, balanceDue } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await sendInvoiceEmail(booking, email, total, balanceDue);

    res.json({ message: 'Invoice sent successfully' });
  } catch (error) {
    console.error('Send invoice error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    // Basic validation
    if (!bookingData.serviceType || !bookingData.date || bookingData.totalAmount === undefined) {
      return res.status(400).json({ message: 'Missing required booking fields: serviceType, date, or totalAmount' });
    }

    let {
      userId, guestName, guestEmail, guestPhone, address,
      serviceType, propertyType, bedrooms, bathrooms, toilets,
      rooms, roomQuantities, addOns, kitchenAddOns, laundryRoomDetails, date, time, frequency, specialInstructions,
      hasPet, petDetails, paymentMethod, tipAmount, totalAmount, status
    } = bookingData;

    // If user is logged in, try to populate missing details from user table
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (user) {
        // Use user details if not provided in booking data, or as per user request:
        // "if any of these are not in the users table, it should show null for the one not available, otherwise it should take them"
        guestName = guestName || user.name || null;
        guestEmail = guestEmail || user.email || null;
        guestPhone = guestPhone || user.phone || null;
        address = address || user.address || null;
      }
    }

    // Generate custom booking ID: BK-YYYYMMDD-XXXX
    const bookingDate = new Date(date);
    const dateStr = bookingDate.toISOString().split('T')[0].replace(/-/g, '');
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    const customId = `BK-${dateStr}-${randomStr}`;

    // Combine rooms and roomQuantities to ensure all selected rooms are captured
    const combinedRooms: Record<string, number> = {};
    if (Array.isArray(rooms)) {
      rooms.forEach((room: string) => {
        combinedRooms[room] = roomQuantities?.[room] || 1;
      });
    } else if (roomQuantities) {
      Object.assign(combinedRooms, roomQuantities);
    }

    // Calculate estimated duration and cleaner count
    let estimatedDuration = 0;
    let cleanerCount = 1;

    try {
      const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
      if (settings && settings.durationSettings) {
        const ds = settings.durationSettings as any;

        // Base time
        let totalMinutes = ds.baseMinutes || 60;

        // Room times
        totalMinutes += (bedrooms || 0) * (ds.perBedroom || 30);
        totalMinutes += (bathrooms || 0) * (ds.perBathroom || 45);
        totalMinutes += (toilets || 0) * (ds.perToilet || 15);

        // Other rooms
        if (rooms && Array.isArray(rooms)) {
          rooms.forEach((room: string) => {
            if (!['Bedroom', 'Bathroom', 'Toilet'].includes(room)) {
              totalMinutes += (roomQuantities?.[room] || 1) * (ds.perOtherRoom || 20);
            }
          });
        }

        // Service Multiplier
        let multiplier = 1.0;
        if (serviceType === 'Deep Cleaning') multiplier = ds.deepCleaningMultiplier || 1.5;
        else if (serviceType === 'Move In/Out') multiplier = ds.moveInOutMultiplier || 2.0;
        else if (serviceType === 'Post-Construction') multiplier = ds.postConstructionMultiplier || 2.5;
        else multiplier = ds.standardCleaningMultiplier || 1.0;

        estimatedDuration = Math.round(totalMinutes * multiplier);

        // Cleaner count: 1 cleaner per 4 hours (240 mins)
        cleanerCount = Math.ceil(estimatedDuration / 240);
        if (cleanerCount < 1) cleanerCount = 1;
      }
    } catch (err) {
      console.error('Error calculating duration:', err);
      // Fallback to basic calculation if settings fail
      estimatedDuration = 120 + ((bedrooms || 0) + (bathrooms || 0)) * 30;
      cleanerCount = Math.ceil(estimatedDuration / 240);
    }

    const booking = await prisma.booking.create({
      data: {
        id: customId,
        userId: userId || null,
        guestName: guestName || null,
        guestEmail: guestEmail || null,
        guestPhone: guestPhone || null,
        address: address || null,
        serviceType,
        propertyType,
        bedrooms: bedrooms || 0,
        bathrooms: bathrooms || 0,
        toilets: toilets || 0,
        rooms: combinedRooms,
        addOns: addOns || [],
        kitchenAddOns: kitchenAddOns ? JSON.parse(JSON.stringify(kitchenAddOns)) : null,
        laundryRoomDetails: laundryRoomDetails ? JSON.parse(JSON.stringify(laundryRoomDetails)) : null,
        date: new Date(date),
        time,
        frequency: frequency || 'One-time',
        specialInstructions: specialInstructions || '',
        hasPet: hasPet || false,
        petDetails: petDetails || {},
        paymentMethod: paymentMethod || null,
        tipAmount: tipAmount || 0,
        totalAmount,
        estimatedDuration,
        cleanerCount,
        status: status || 'BOOKED',
      },
    });

    // Notify admins about the new booking
    await notifyAdmins({
      type: 'BOOKING_CREATED',
      title: 'New Booking Created',
      message: `A new booking has been created by ${guestName || 'Guest'} for ${serviceType} on ${new Date(date).toLocaleDateString()}`,
      data: {
        bookingId: customId,
        customerId: userId,
        customerName: guestName,
        serviceType,
        bookingDate: date,
        totalAmount: totalAmount.toString()
      }
    });

    // Notify cleaners about the new available job
    await notifyCleaners({
      type: 'BOOKING_CREATED',
      title: 'New Job Alert! 🔔',
      message: `${guestName || 'A customer'} just posted a new ${serviceType} job in ${address || 'your area'}. Claim it now!`,
      data: {
        bookingId: customId,
        serviceType,
        date,
        totalAmount: totalAmount.toString()
      }
    });

    // Send confirmation email to customer
    if (guestEmail) {
      console.log(`📧 Calling sendBookingConfirmation for ${guestEmail}`);
      const emailResult = await sendBookingConfirmation(booking, guestEmail);
      console.log(`📧 sendBookingConfirmation result: ${emailResult}`);
    } else {
      console.warn('⚠️ No guestEmail found, skipping confirmation email');
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Create booking error details:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { userId, cleanerId } = req.query;

    const bookings = await prisma.booking.findMany({
      where: {
        AND: [
          userId ? { userId: String(userId) } : {},
          cleanerId ? { cleanerId: String(cleanerId) } : {},
        ]
      },
      include: {
        user: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        cleaner: {
          select: {
            name: true,
            phone: true
          }
        }
      },
      orderBy: { date: 'asc' },
    });

    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { id: _, ...dataWithoutId } = updateData;

    // Check if this is a reschedule (date is being changed)
    const existingBooking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existingBooking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...dataWithoutId,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });

    // Handle Cancellation
    if (updateData.status === 'CANCELLED' && existingBooking.status !== 'CANCELLED') {
      const now = new Date();
      const serviceDateTime = new Date(existingBooking.date);

      // Parse time (e.g., "10:00 AM")
      const timeStr = existingBooking.time;
      const [time, period] = timeStr.split(' ');
      const [hours, minutes] = time.split(':').map(Number);
      let hour24 = hours;
      if (period === 'PM' && hours !== 12) hour24 += 12;
      if (period === 'AM' && hours === 12) hour24 = 0;

      serviceDateTime.setHours(hour24, minutes, 0, 0);

      const hoursUntilService = (serviceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

      let refundAmount = 0;
      let penaltyCharge = 0;
      const totalAmount = Number(existingBooking.totalAmount);

      if (hoursUntilService >= 24) {
        refundAmount = totalAmount;
        penaltyCharge = 0;
      } else if (hoursUntilService > 0) {
        refundAmount = totalAmount * 0.5;
        penaltyCharge = totalAmount * 0.5;
      } else {
        refundAmount = 0;
        penaltyCharge = totalAmount;
      }

      // Notify admins
      await notifyAdmins({
        type: 'BOOKING_CANCELLED',
        title: 'Booking Cancelled',
        message: `Booking ${id} has been cancelled by customer ${existingBooking.guestName || 'Guest'}. Refund: $${refundAmount.toFixed(2)}, Penalty: $${penaltyCharge.toFixed(2)}`,
        data: {
          bookingId: id,
          customerId: existingBooking.userId,
          customerName: existingBooking.guestName,
          serviceType: existingBooking.serviceType,
          refundAmount,
          penaltyCharge,
          totalAmount: totalAmount.toString()
        }
      });

      return res.json({
        message: 'Booking cancelled successfully',
        booking,
        refundAmount,
        penaltyCharge
      });
    }

    // If date was changed (reschedule), notify admins
    if (updateData.date && existingBooking.date !== new Date(updateData.date)) {
      const oldDate = existingBooking.date.toLocaleDateString();
      const newDate = new Date(updateData.date).toLocaleDateString();

      await notifyAdmins({
        type: 'BOOKING_UPDATED',
        title: 'Booking Rescheduled',
        message: `Booking ${id} has been rescheduled from ${oldDate} to ${newDate} by customer ${existingBooking.guestName || 'Guest'}`,
        data: {
          bookingId: id,
          customerId: existingBooking.userId,
          customerName: existingBooking.guestName,
          serviceType: existingBooking.serviceType,
          oldDate: oldDate,
          newDate: newDate,
          totalAmount: existingBooking.totalAmount.toString()
        }
      });
    }

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
};

export const claimJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cleanerId } = req.body;

    if (!cleanerId) {
      return res.status(400).json({ message: 'Cleaner ID is required' });
    }

    const booking = await prisma.booking.findUnique({
      where: { id }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    if (booking.cleanerId) {
      return res.status(400).json({ message: 'Job already claimed by another cleaner' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        cleanerId,
        status: 'CONFIRMED'
      },
      include: {
        user: true,
        cleaner: true
      }
    });

    // Notify customer
    if (updatedBooking.user?.id) {
      await createNotification({
        userId: updatedBooking.user.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Cleaner Assigned!',
        message: `${updatedBooking.cleaner?.name} has been assigned to your cleaning on ${new Date(updatedBooking.date).toLocaleDateString()}.`,
        data: { bookingId: updatedBooking.id }
      });
    }

    res.json({
      message: 'Job claimed successfully',
      booking: updatedBooking
    });
  } catch (error) {
    console.error('Claim job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
