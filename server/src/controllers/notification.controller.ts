import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get all notifications for a user
export const getUserNotifications = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { page = 1, limit = 10, isRead } = req.query;

  try {
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = { userId };
    if (isRead !== undefined) {
      where.isRead = isRead === 'true';
    }

    // Get total count
    const totalCount = await prisma.notification.count({ where });

    // Fetch notifications
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limitNum,
    });

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      data: notifications,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unread notification count
export const getUnreadCount = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark notification as read
export const markAsRead = async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  try {
    const notification = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    res.json(notification);
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Mark all notifications as read
export const markAllAsRead = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete notification
export const deleteNotification = async (req: Request, res: Response) => {
  const { notificationId } = req.params;

  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    });

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create notification (internal use)
export const createNotification = async (
  userId: string,
  type: string,
  title: string,
  message: string,
  data?: any
) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
      },
    });
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
  }
};

// Get unread notification counts by type
export const getUnreadCountsByType = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const bookingCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        type: 'BOOKING_CREATED'
      },
    });

    const reviewCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        type: 'REVIEW_RECEIVED'
      },
    });

    const messageCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
        type: 'MESSAGE_RECEIVED'
      },
    });

    res.json({
      bookings: bookingCount,
      reviews: reviewCount,
      messaging: messageCount,
    });
  } catch (error) {
    console.error('Get unread counts by type error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
