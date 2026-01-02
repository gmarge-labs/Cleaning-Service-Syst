import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { createNotification, notifyAdmins, notifyCleaners } from '../utils/notification';
import { sendBookingConfirmation, sendInvoiceEmail, sendEmail } from '../utils/email.service';
import { calculateBookingDuration } from '../utils/booking';
import { emitToUser } from '../utils/socket';
// import { uploadBase64Image } from '../utils/googleDrive'; // TODO: Google Drive uploads disabled

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

    // Generate custom booking ID: BK-YYYYMMDD-XXX
    const bookingDate = new Date(date);
    // Use UTC date components to match the ISO date string sent from frontend
    const year = bookingDate.getUTCFullYear();
    const month = String(bookingDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(bookingDate.getUTCDate()).padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Count bookings for this specific day to get the sequence number
    const startOfDay = new Date(bookingDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(bookingDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const count = await prisma.booking.count({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, '0');
    const customId = `BK-${dateStr}-${sequence}`;

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
    const { estimatedDuration, cleanerCount } = await calculateBookingDuration({
      bedrooms, bathrooms, toilets, rooms, roomQuantities, kitchenAddOns, laundryRoomDetails, addOns, serviceType
    });

    let paymentPerHour = 20; // Default fallback
    try {
      const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
      if (settings && settings.cleanerPay) {
        const cp = settings.cleanerPay as any;
        paymentPerHour = cp.level1 || 20;
      }
    } catch (err) {
      console.error('Error fetching cleaner pay settings:', err);
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
        paymentPerHour,
        status: (status as any) || 'PENDING',
        securityCode: Math.floor(1000 + Math.random() * 9000).toString(),
      } as any,
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
      message: `A new ${serviceType} job is available in ${address || 'your area'}. Claim it now!`,
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
    const { userId, cleanerId, status } = req.query;
    console.log('Fetching bookings with query:', { userId, cleanerId, status });

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
      },
      orderBy: { date: 'asc' },
    });

    console.log(`Found ${bookings.length} bookings`);
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

    // Recalculate duration and cleaner count if relevant fields are updated
    let { estimatedDuration, cleanerCount } = existingBooking;
    const relevantFields = ['bedrooms', 'bathrooms', 'toilets', 'rooms', 'roomQuantities', 'kitchenAddOns', 'laundryRoomDetails', 'addOns', 'serviceType'];
    const isRelevantUpdate = relevantFields.some(field => field in updateData);

    if (isRelevantUpdate) {
      const mergedData = {
        ...existingBooking,
        ...updateData
      };
      const result = await calculateBookingDuration(mergedData);
      estimatedDuration = result.estimatedDuration;
      cleanerCount = result.cleanerCount;
    }

    // TODO: Google Drive uploads disabled for now - storing photos directly in database
    // Handle Google Drive Uploads for Completion Photos
    // let drivePhotoLinks = updateData.completionPhotos;
    // if (updateData.completionPhotos && Array.isArray(updateData.completionPhotos)) {
    //   const now = new Date();
    //   const year = now.getFullYear().toString();
    //   const month = (now.getMonth() + 1).toString().padStart(2, '0');
    //   const day = now.getDate().toString().padStart(2, '0');
    //   
    //   const folderPath = [year, month, day, `Booking_${id}`, 'Completion'];
    //   
    //   const uploadPromises = updateData.completionPhotos.map(async (base64: string, index: number) => {
    //     // Only upload if it's a base64 string (starts with data:image)
    //     if (base64.startsWith('data:image')) {
    //       const timestamp = new Date().getTime();
    //       return await uploadBase64Image(base64, `Completion_${timestamp}_${index + 1}.jpg`, folderPath);
    //     }
    //     return base64; // Already a link
    //   });
    //   
    //   drivePhotoLinks = await Promise.all(uploadPromises);
    // }

    // Handle Google Drive Uploads for Revision Photos
    // let revisionPhotoLinks = updateData.revisionPhotos;
    // if (updateData.revisionPhotos && Array.isArray(updateData.revisionPhotos)) {
    //   const now = new Date();
    //   const year = now.getFullYear().toString();
    //   const month = (now.getMonth() + 1).toString().padStart(2, '0');
    //   const day = now.getDate().toString().padStart(2, '0');
    //   
    //   const folderPath = [year, month, day, `Booking_${id}`, 'Revision'];
    //   
    //   const uploadPromises = updateData.revisionPhotos.map(async (base64: string, index: number) => {
    //     if (base64.startsWith('data:image')) {
    //       const timestamp = new Date().getTime();
    //       return await uploadBase64Image(base64, `Revision_${timestamp}_${index + 1}.jpg`, folderPath);
    //     }
    //     return base64;
    //   });
    //   
    //   revisionPhotoLinks = await Promise.all(uploadPromises);
    // }

    // Store photos directly in database (base64 format)
    const completionPhotos = updateData.completionPhotos;
    const revisionPhotos = updateData.revisionPhotos;

    const booking = await prisma.booking.update({
      where: { id },
      data: {
        ...dataWithoutId,
        completionPhotos: completionPhotos,
        revisionPhotos: revisionPhotos,
        date: updateData.date ? new Date(updateData.date) : undefined,
        estimatedDuration,
        cleanerCount,
        startTime: updateData.status === 'IN_PROGRESS' ? new Date() : undefined,
        endTime: updateData.status === 'COMPLETED' ? new Date() : undefined,
      },
      include: {
        claimedBy: true
      }
    });

    // Notify cleaner if job is started or revision requested
    if (updateData.status === 'IN_PROGRESS') {
      (booking as any).claimedBy.forEach((cleaner: any) => {
        emitToUser(cleaner.id, 'job_started', { bookingId: id });
      });
    }

    if (updateData.status === 'REVISION_REQUESTED') {
      (booking as any).claimedBy.forEach((cleaner: any) => {
        createNotification({
          userId: cleaner.id,
          type: 'REVISION_REQUESTED',
          title: 'Revision Requested',
          message: `A revision has been requested for job ${id}. Please check the details.`,
          data: { bookingId: id }
        });
        emitToUser(cleaner.id, 'revision_requested', { bookingId: id });
      });
    }

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

    const booking = await (prisma as any).booking.findUnique({
      where: { id },
      include: {
        claimedBy: true
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Check if cleaner already claimed this job
    const alreadyClaimed = (booking as any).claimedBy.some((c: any) => c.id === cleanerId);
    if (alreadyClaimed) {
      return res.status(400).json({ message: 'You have already claimed this job' });
    }

    // Check if job is already full
    const requiredCleaners = (booking as any).cleanerCount || 1;
    if ((booking as any).claimedBy.length >= requiredCleaners) {
      return res.status(400).json({ message: 'Job is already full' });
    }

    // Generate security code if not already set
    const securityCode = (booking as any).securityCode || Math.floor(1000 + Math.random() * 9000).toString();

    const updatedBooking = await (prisma as any).booking.update({
      where: { id },
      data: {
        claimedBy: {
          connect: { id: cleanerId }
        },
        securityCode,
        // For compatibility with single-cleaner views, set cleanerId if it's not already set
        cleanerId: (booking as any).cleanerId || cleanerId,
        // If this was the last required cleaner, mark as CONFIRMED
        status: ((booking as any).claimedBy.length + 1 >= requiredCleaners) ? 'CONFIRMED' : 'PENDING'
      },
      include: {
        user: true,
        claimedBy: true
      }
    });

    // Notify customer
    if ((updatedBooking as any).user?.id) {
      const cleaner = (updatedBooking as any).claimedBy.find((c: any) => c.id === cleanerId);
      await createNotification({
        userId: (updatedBooking as any).user.id,
        type: 'BOOKING_CONFIRMED',
        title: 'Cleaner Assigned!',
        message: `${cleaner?.name || 'A cleaner'} has been assigned to your cleaning on ${new Date((updatedBooking as any).date).toLocaleDateString()}.`,
        data: { bookingId: updatedBooking.id }
      });
    }

    res.json({
      message: 'Job claimed successfully',
      booking: updatedBooking
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const notifyArrival = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cleanerId, securityCode } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: true,
        claimedBy: {
          where: { id: cleanerId }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const cleaner = booking.claimedBy[0];
    if (!cleaner) {
      return res.status(404).json({ message: 'Cleaner not found or not assigned to this job' });
    }

    // Update booking status to ARRIVED and store the code provided by the cleaner
    await (prisma.booking as any).update({
      where: { id },
      data: { 
        status: 'ARRIVED',
        cleanerProvidedCode: securityCode || null
      }
    });

    // Send notification to customer
    if (booking.user?.id) {
      await createNotification({
        userId: booking.user.id,
        type: 'CLEANER_ARRIVED',
        title: 'Cleaner Arrived!',
        message: `${cleaner.name} has arrived at your location. Please verify their credentials in your dashboard.`,
        data: { 
          bookingId: booking.id,
          cleanerName: cleaner.name,
          cleanerId: cleaner.id,
          cleanerImage: (cleaner as any).profileImage,
          providedCode: securityCode
        }
      });
    }

    // Also send email if guestEmail exists
    const customerEmail = booking.guestEmail || booking.user?.email;
    if (customerEmail) {
      await sendEmail({
        to: customerEmail,
        subject: 'Your Cleaner has Arrived!',
        templateType: 'broadcast',
        variables: {
          name: booking.guestName || booking.user?.name || 'Customer',
          message: `
            Your cleaner, ${cleaner.name}, has arrived for your booking ${booking.id}.
            
            For your security, please verify their credentials:
            Name: ${cleaner.name}
            ID: ${cleaner.id}
            
            The cleaner will ask for a verification code if required.
          `
        }
      });
    }

    res.json({ message: 'Arrival notification sent successfully' });
  } catch (error) {
    console.error('Notify arrival error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
