import { Response } from 'express';
import { PrismaClient, Role } from '@prisma/client';
import { AuthRequest } from '../utils/auth';

const prisma = new PrismaClient() as any;

export const getConversations = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });
    console.log(`API: Getting conversations for user ${userId}`);

    // Get all users that the current user has exchanged messages with
    const messages = await (prisma as any).message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    });
    console.log(`API: Found ${messages.length} messages for user ${userId}`);

    // Group by conversation partner
    const conversationsMap = new Map();

    (messages as any[]).forEach(msg => {
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;
      if (!conversationsMap.has(partner.id)) {
        conversationsMap.set(partner.id, {
          id: partner.id,
          name: partner.name,
          role: partner.role,
          lastMessage: msg.text,
          time: msg.createdAt,
          unread: msg.receiverId === userId && !msg.isRead ? 1 : 0,
          online: false, // You can implement online status later
        });
      } else if (msg.receiverId === userId && !msg.isRead) {
        const conv = conversationsMap.get(partner.id);
        conv.unread += 1;
      }
    });

    res.json(Array.from(conversationsMap.values()));
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { partnerId } = req.params;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const messages = await (prisma as any).message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId }
        ]
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Mark messages as read
    await (prisma as any).message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const senderId = req.user?.id;
    const { receiverId, text } = req.body;

    if (!senderId) return res.status(401).json({ message: 'Unauthorized' });

    const message = await (prisma as any).message.create({
      data: {
        senderId,
        receiverId,
        text
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getAvailableContacts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    let contacts;

    if (userRole === 'CLEANER') {
      // Cleaners can message Admins, Support, and Supervisors
      contacts = await prisma.user.findMany({
        where: {
          role: {
            in: ['ADMIN', 'SUPPORT', 'SUPERVISOR']
          }
        },
        select: {
          id: true,
          name: true,
          role: true
        }
      });
    } else {
      // Admins, Support, Supervisors can message everyone (Cleaners, Customers, and each other)
      contacts = await prisma.user.findMany({
        where: {
          id: { not: userId }
        },
        select: {
          id: true,
          name: true,
          role: true
        }
      });
    }

    res.json(contacts);
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
