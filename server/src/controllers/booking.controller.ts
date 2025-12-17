import { Request, Response } from 'express';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;
    console.log('Received booking data:', JSON.stringify(bookingData, null, 2));
    
    // Basic validation
    if (!bookingData.serviceType || !bookingData.date || bookingData.totalAmount === undefined) {
      return res.status(400).json({ message: 'Missing required booking fields: serviceType, date, or totalAmount' });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: bookingData.userId || null,
        guestName: bookingData.guestName || null,
        guestEmail: bookingData.guestEmail || null,
        guestPhone: bookingData.guestPhone || null,
        serviceType: bookingData.serviceType,
        propertyType: bookingData.propertyType,
        bedrooms: bookingData.bedrooms || 0,
        bathrooms: bookingData.bathrooms || 0,
        toilets: bookingData.toilets || 0,
        rooms: bookingData.rooms || {},
        addOns: bookingData.addOns || [],
        date: new Date(bookingData.date),
        time: bookingData.time,
        frequency: bookingData.frequency || 'One-time',
        specialInstructions: bookingData.specialInstructions || '',
        hasPet: bookingData.hasPet || false,
        petDetails: bookingData.petDetails || {},
        paymentMethod: bookingData.paymentMethod || null,
        tipAmount: bookingData.tipAmount || 0,
        totalAmount: bookingData.totalAmount,
        status: bookingData.status || 'PENDING',
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
