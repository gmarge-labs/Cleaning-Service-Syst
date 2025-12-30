import { Request, Response, NextFunction } from 'express';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // For now, we'll expect the userId in the 'x-user-id' header
    // In a real app, this would be a JWT token
    const userId = req.headers['x-user-id'] as string;
    
    if (!userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    req.user = {
      id: user.id,
      role: user.role
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'Invalid authentication' });
  }
};
