import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification, notifyAdmins } from '../utils/notification';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;
    console.log('Received booking data:', JSON.stringify(bookingData, null, 2));
    
    // Basic validation
    if (!bookingData.serviceType || !bookingData.date || bookingData.totalAmount === undefined) {
      return res.status(400).json({ message: 'Missing required booking fields: serviceType, date, or totalAmount' });
    }

    let { 
      userId, guestName, guestEmail, guestPhone, address,
      serviceType, propertyType, bedrooms, bathrooms, toilets,
      rooms, addOns, date, time, frequency, specialInstructions,
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
        rooms: bookingData.roomQuantities || rooms || {},
        addOns: addOns || [],
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

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Create booking error details:', error);
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

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...dataWithoutId,
        // Ensure date is handled correctly if provided
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });

    res.json({
      message: 'Booking updated successfully',
      booking,
    });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
  }
};
