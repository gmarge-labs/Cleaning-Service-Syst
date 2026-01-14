import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createNotification, notifyAdmins, notifyCleaners } from '../utils/notification';
import { sendBookingConfirmation, sendInvoiceEmail, sendEmail } from '../utils/email.service';
import { calculateBookingDuration } from '../utils/booking';
import { emitToUser } from '../utils/socket';
import { PaymentService } from '../utils/payment.service';
import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { generateUserId } from '../utils/idGenerator';

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

export async function createPaymentIntent(req: Request, res: Response) {
  try {
    const { amount, bookingId, customerEmail } = req.body;

    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const paymentIntent = await PaymentService.createPaymentIntent(amount, 'usd', {
      bookingId: bookingId || 'new_booking',
      customerEmail: customerEmail || 'guest',
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({
      message: 'Failed to create payment intent',
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

export const createBooking = async (req: Request, res: Response) => {
  try {
    const bookingData = req.body;

    // More detailed validation
    const missingFields = [];
    if (!bookingData.serviceType) missingFields.push('serviceType');
    if (!bookingData.date) missingFields.push('date');
    if (bookingData.totalAmount === undefined || bookingData.totalAmount === null) missingFields.push('totalAmount');

    if (missingFields.length > 0) {
      console.error('Missing booking fields:', missingFields, 'Received payload:', bookingData);
      return res.status(400).json({
        message: `Missing required booking fields: ${missingFields.join(', ')}`,
        missing: missingFields,
        received: Object.keys(bookingData)
      });
    }
    let {
      userId, guestName, guestEmail, guestPhone, address,
      serviceType, propertyType, bedrooms, bathrooms, toilets,
      rooms, roomQuantities, addOns, kitchenAddOns, laundryRoomDetails, date, time, frequency, specialInstructions,
      hasPet, petDetails, paymentMethod, tipAmount, totalAmount, status
    } = bookingData;

    // Auto-create customer account for guest bookings
    let isNewUser = false;
    if (!userId && guestEmail) {
      // Check if user with this email already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: guestEmail.toLowerCase() }
      });

      if (existingUser) {
        // User exists, link booking to this user
        userId = existingUser.id;
        console.log(`✅ Found existing user ${existingUser.id} for email ${guestEmail}`);
      } else {
        // Create new customer account
        const defaultPassword = '123456';
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        const newUserId = await generateUserId(Role.CUSTOMER);

        const newUser = await prisma.user.create({
          data: {
            id: newUserId,
            name: guestName || 'Guest',
            email: guestEmail.toLowerCase(),
            password: hashedPassword,
            phone: guestPhone || null,
            address: address || null,
            role: Role.CUSTOMER,
          },
        });

        userId = newUser.id;
        isNewUser = true;
        console.log(`✅ Created new customer account ${newUserId} for ${guestEmail}`);
      }
    }

    // If user is logged in, try to populate missing details from user table
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      if (user) {
        guestName = guestName || user.name || null;
        guestEmail = guestEmail || user.email || null;
        guestPhone = guestPhone || user.phone || null;
        address = address || user.address || null;
      }
    }

    // Parse the date string to avoid timezone issues
    let year: number, month: number, day: number;
    let bookingDate: Date;

    if (typeof date === 'string') {
      const parts = date.split('T')[0].split('-');
      year = parseInt(parts[0]);
      month = parseInt(parts[1]);
      day = parseInt(parts[2]);
      bookingDate = new Date(year, month - 1, day);
    } else {
      bookingDate = new Date(date);
      year = bookingDate.getFullYear();
      month = bookingDate.getMonth() + 1;
      day = bookingDate.getDate();
    }

    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}${monthStr}${dayStr}`;

    // Count bookings for this specific day to get the sequence number
    const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
    const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);

    // Use a transaction to ensure atomic ID generation and booking creation
    let customId: string;
    let maxRetries = 10; // Increase retries
    let retryCount = 0;

    while (retryCount < maxRetries) {
      try {
        // Add milliseconds to make ID more unique
        const timestamp = Date.now().toString().slice(-3); // Last 3 digits of timestamp

        // Count existing bookings for this day
        const count = await prisma.booking.count({
          where: {
            date: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
        });

        // Generate ID with timestamp to avoid collisions
        const sequence = String(count + 1 + retryCount).padStart(3, '0');
        customId = `BK-${dateStr}-${sequence}-${timestamp}`;

        // Check if this ID already exists
        const existingBooking = await prisma.booking.findUnique({
          where: { id: customId }
        });

        if (!existingBooking) {
          // ID is unique, break the loop
          break;
        }

        // ID exists, retry with incremented sequence
        retryCount++;

        // Add small delay to avoid tight loop
        await new Promise(resolve => setTimeout(resolve, 10));
      } catch (err) {
        retryCount++;
        if (retryCount >= maxRetries) {
          // Fallback to UUID if all retries fail
          const { v4: uuidv4 } = await import('uuid');
          customId = `BK-${dateStr}-${uuidv4().split('-')[0]}`;
          break;
        }
      }
    }

    if (!customId!) {
      throw new Error('Failed to generate booking ID');
    }

    // Combine rooms and roomQuantities
    const combinedRooms: Record<string, number> = {};
    if (Array.isArray(rooms)) {
      rooms.forEach((room: string) => {
        combinedRooms[room] = roomQuantities?.[room] || 1;
      });
    } else if (roomQuantities) {
      Object.assign(combinedRooms, roomQuantities);
    }

    const { estimatedDuration, cleanerCount } = await calculateBookingDuration(bookingData);
    let paymentPerHour = 25; // Default

    const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
    if (settings && settings.cleanerPay) {
      const cp = settings.cleanerPay as any;
      paymentPerHour = cp.level1 || 25;
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
        kitchenAddOns: kitchenAddOns || {},
        laundryRoomDetails: laundryRoomDetails || {},
        date: bookingDate,
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
        paymentPerHour,
        status: status || 'PENDING',
      },
    });

    // Notify admins and cleaners
    await notifyAdmins({
      type: 'BOOKING_CREATED',
      title: 'New Booking Created',
      message: `A new booking has been created by ${guestName || 'Guest'} for ${serviceType} on ${bookingDate.toLocaleDateString()}`,
      data: { bookingId: customId }
    });

    await notifyCleaners({
      type: 'BOOKING_CREATED',
      title: 'New Job Alert! 🔔',
      message: `${guestName || 'A customer'} just posted a new ${serviceType} job in ${address || 'your area'}. Claim it now!`,
      data: { bookingId: customId, serviceType, date: bookingDate }
    });

    if (guestEmail) {
      console.log(`📧 Calling sendBookingConfirmation for ${guestEmail}`);
      const emailResult = await sendBookingConfirmation(booking, guestEmail);
      console.log(`📧 sendBookingConfirmation result: ${emailResult}`);

      // If this is a new user, send welcome email with login credentials
      if (isNewUser) {
        console.log(`📧 Sending welcome email with login credentials to new user ${guestEmail}`);
        try {
          const { sendWelcomeEmail } = await import('../utils/email.service');
          const newUserData = await prisma.user.findUnique({
            where: { id: userId! }
          });
          if (newUserData) {
            const welcomeEmailResult = await sendWelcomeEmail(newUserData, '123456');
            console.log(`📧 sendWelcomeEmail result: ${welcomeEmailResult}`);
          }
        } catch (emailError) {
          console.error('❌ Error sending welcome email:', emailError);
        }
      }
    }

    res.status(201).json({
      message: 'Booking created successfully',
      booking,
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

export const getBookings = async (req: Request, res: Response) => {
  try {
    const { userId, cleanerId, status } = req.query;
    const bookings = await prisma.booking.findMany({
      where: {
        AND: [
          userId ? { userId: String(userId) } : {},
          cleanerId ? {
            OR: [
              { cleanerId: String(cleanerId) },
              { claimedBy: { some: { id: String(cleanerId) } } }
            ]
          } : {},
          status ? (
            typeof status === 'string' && status.includes(',')
              ? { status: { in: status.split(',') } }
              : Array.isArray(status)
                ? { status: { in: status } }
                : { status: status as any }
          ) : {},
        ]
      },
      include: {
        user: { select: { name: true, phone: true, email: true } },
        cleaner: { select: { name: true, phone: true } },
        claimedBy: { select: { id: true, name: true, phone: true, email: true } }
      },
      orderBy: { date: 'asc' },
    });
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
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
        },
        claimedBy: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true
          }
        },
        reviews: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Get booking by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateBooking = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const { id: _, ...dataWithoutId } = updateData;

    const existingBooking = await prisma.booking.findUnique({ where: { id } });
    if (!existingBooking) return res.status(404).json({ message: 'Booking not found' });

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...dataWithoutId,
        date: updateData.date ? new Date(updateData.date) : undefined,
      },
    });

    res.json({ message: 'Booking updated successfully', booking });
  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const claimJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cleanerId } = req.body;

    if (!cleanerId) return res.status(400).json({ message: 'Cleaner ID is required' });

    const booking = await (prisma.booking as any).findUnique({
      where: { id },
      include: { claimedBy: true }
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const alreadyClaimed = (booking as any).claimedBy.some((c: any) => c.id === cleanerId);
    if (alreadyClaimed) return res.status(400).json({ message: 'You have already claimed this job' });

    const requiredCleaners = (booking as any).cleanerCount || 1;
    if ((booking as any).claimedBy.length >= requiredCleaners) return res.status(400).json({ message: 'Job is already full' });

    const updatedBooking = await (prisma.booking as any).update({
      where: { id },
      data: {
        claimedBy: { connect: { id: cleanerId } },
        cleanerId: (booking as any).cleanerId || cleanerId,
        status: ((booking as any).claimedBy.length + 1 >= requiredCleaners) ? 'CONFIRMED' : (booking as any).status
      },
      include: { user: true, claimedBy: true }
    });

    if ((updatedBooking as any).user?.id) {
      const cleaner = (updatedBooking as any).claimedBy.find((c: any) => c.id === cleanerId);
      await createNotification({
        userId: (updatedBooking as any).user.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Cleaner Assigned!',
        message: `${cleaner?.name || 'A cleaner'} has been assigned to your cleaning.`,
        data: { bookingId: updatedBooking.id }
      });
    }

    res.json({ message: 'Job claimed successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Claim job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const notifyArrival = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { securityCode, cleanerId } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const cleaner = await prisma.user.findUnique({ where: { id: cleanerId } });
    if (!cleaner) return res.status(404).json({ message: 'Cleaner not found' });

    const updatedBooking = await (prisma.booking as any).update({
      where: { id },
      data: {
        status: 'ARRIVED',
        cleanerProvidedCode: securityCode || null,
        startTime: new Date()
      }
    });

    if (booking.userId) {
      await createNotification({
        userId: booking.userId,
        type: 'CLEANER_ARRIVED' as any,
        title: 'Cleaner Arrived!',
        message: `${cleaner.name} has arrived at your location.`,
        data: {
          bookingId: booking.id,
          cleanerName: cleaner.name,
          cleanerId: cleaner.id,
          providedCode: securityCode
        }
      });
    }

    res.json({ message: 'Arrival noted successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Notify arrival error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const completeJob = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes, issues, photos } = req.body;

    if (status !== 'COMPLETED') return res.status(400).json({ message: 'Invalid status for completion' });

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const photoLinks = [];
    if (photos && Array.isArray(photos)) {
      const { uploadToDrive } = await import('../utils/googleDrive.utils');
      for (let i = 0; i < photos.length; i++) {
        const photoBase64 = photos[i];
        const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, 'base64');
        const fileName = `job_${id}_photo_${i + 1}.jpg`;
        const uploadResult = await uploadToDrive(fileName, 'image/jpeg', buffer);
        photoLinks.push(uploadResult.webViewLink);
      }
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: { status: 'COMPLETED', completionNotes: notes, completionIssues: issues, completionPhotos: photoLinks }
    });

    await notifyAdmins({
      type: 'BOOKING_COMPLETED',
      title: 'Job Completed! ✅',
      message: `Job ${id} has been marked as completed.`,
      data: { bookingId: id, photoLinks }
    });

    if (booking.userId) {
      await createNotification({
        userId: booking.userId,
        type: 'BOOKING_COMPLETED',
        title: 'Your cleaning is done! ✨',
        message: `Great news! Your ${booking.serviceType} has been completed.`,
        data: { bookingId: id }
      });
    }

    res.json({ message: 'Job completed successfully', booking: updatedBooking, photoLinks });
  } catch (error) {
    console.error('Complete job error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
