import { PrismaClient } from '@prisma/client';
import { emitToUser } from './socket';

const prisma = new PrismaClient();

export type NotificationType = 'BOOKING_CREATED' | 'BOOKING_UPDATED' | 'BOOKING_CANCELLED' | 'USER_REGISTERED' | 'SYSTEM_ALERT' | 'REVIEW_RECEIVED' | 'MESSAGE_RECEIVED';

interface CreateNotificationParams {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
}

export const createNotification = async ({
  userId,
  type,
  title,
  message,
  data = {}
}: CreateNotificationParams) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
        isRead: false
      }
    });

    // Emit real-time notification via socket
    emitToUser(userId, 'new_notification', notification);

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

export const notifyAdmins = async (params: Omit<CreateNotificationParams, 'userId'>) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPERVISOR']
        }
      },
      select: { id: true }
    });

    const notifications = await Promise.all(
      admins.map(admin =>
        createNotification({
          ...params,
          userId: admin.id
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error notifying admins:', error);
    return [];
  }
};

export const notifyCleaners = async (params: Omit<CreateNotificationParams, 'userId'>) => {
  try {
    const cleaners = await prisma.user.findMany({
      where: {
        role: 'CLEANER'
      },
      select: { id: true }
    });

    const notifications = await Promise.all(
      cleaners.map(cleaner =>
        createNotification({
          ...params,
          userId: cleaner.id
        })
      )
    );

    return notifications;
  } catch (error) {
    console.error('Error notifying cleaners:', error);
    return [];
  }
};

export const notifyUser = async (params: CreateNotificationParams) => {
  return createNotification(params);
};