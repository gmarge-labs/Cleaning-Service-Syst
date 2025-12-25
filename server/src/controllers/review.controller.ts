import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { createNotification, notifyAdmins } from '../utils/notification';
import { sendEmail } from '../utils/email.service';

const prisma = new PrismaClient();

export const createReview = async (req: Request, res: Response) => {
  try {
    const { bookingId, rating, comment, userId } = req.body;
    console.log('Creating review for booking:', bookingId);

    if (!bookingId || !rating) {
      return res.status(400).json({ message: 'Booking ID and rating are required' });
    }

    // Relaxed check: If booking exists, we can do some validation, 
    // but we allow the review even if it's a dummy ID
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId }
    });

    if (booking) {
      // If it's a real booking, we can still check ownership if userId is provided
      if (booking.userId && userId && booking.userId !== userId) {
        console.warn(`User ${userId} attempted to review booking ${bookingId} owned by ${booking.userId}`);
        // For now, we'll just log a warning and allow it as requested by the user
      }
    }

    const review = await prisma.review.create({
      data: {
        bookingId: booking ? bookingId : null,
        rating,
        comment: comment || '',
      }
    });

    // Notify admins about the new review
    await notifyAdmins({
      type: 'REVIEW_RECEIVED',
      title: 'New Review Received',
      message: `A new ${rating}-star review has been submitted for booking ${bookingId}.`,
      data: { bookingId, rating, reviewId: review.id }
    });

    res.status(201).json(review);
  } catch (error: any) {
    console.error('Create review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getReviews = async (req: Request, res: Response) => {
  try {
    console.log('Fetching all reviews');
    const reviews = await prisma.review.findMany({
      include: {
        booking: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log(`Found ${reviews.length} reviews`);
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getPublishedReviews = async (req: Request, res: Response) => {
  try {
    console.log('Fetching published reviews');
    const reviews = await prisma.review.findMany({
      where: {
        status: 'PUBLISHED'
      },
      include: {
        booking: {
          include: {
            user: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    console.log(`Found ${reviews.length} published reviews`);
    res.json(reviews);
  } catch (error) {
    console.error('Get published reviews error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminReply } = req.body;
    console.log(`Updating review ${id} status to ${status}`);

    const review = await prisma.review.update({
      where: { id },
      data: {
        status,
        adminReply,
        repliedAt: adminReply ? new Date() : undefined
      },
      include: {
        booking: {
          include: {
            user: true
          }
        }
      }
    });

    // If there's an admin reply, send an email to the customer
    if (adminReply && review.booking) {
      const customerEmail = review.booking.user?.email || review.booking.guestEmail;
      const customerName = review.booking.user?.name || review.booking.guestName || 'Valued Customer';

      if (customerEmail) {
        try {
          await sendEmail({
            to: customerEmail,
            subject: 'Response to your Sparkleville review',
            templateType: 'broadcast',
            variables: {
              name: customerName,
              message: `Hello ${customerName},\n\nThank you for your review! Our team has responded to your feedback:\n\n"${adminReply}"\n\nBest regards,\nThe Sparkleville Team`
            }
          });
          console.log(`Reply email sent to ${customerEmail}`);
        } catch (emailError) {
          console.error('Error sending review reply email:', emailError);
        }
      }
    }

    res.json(review);
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
