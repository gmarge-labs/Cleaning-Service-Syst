import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NotificationType = 'BOOKING_CREATED' | 'BOOKING_UPDATED' | 'BOOKING_CANCELLED' | 'USER_REGISTERED' | 'SYSTEM_ALERT';

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
    return await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data,
        isRead: false
      }
    });
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