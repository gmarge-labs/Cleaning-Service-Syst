import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification, notifyAdmins } from '../utils/notification';
import { sendBookingConfirmation } from '../utils/email.service';

const prisma = new PrismaClient();

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

    // Send confirmation email to customer
    if (guestEmail) {
      await sendBookingConfirmation(booking, guestEmail);
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
    const { userId } = req.query;
    
    const bookings = await prisma.booking.findMany({
      where: userId ? { userId: String(userId) } : {},
      orderBy: { createdAt: 'desc' },
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
