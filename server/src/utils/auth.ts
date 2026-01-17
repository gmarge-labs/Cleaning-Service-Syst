import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import prisma from './prisma';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: Role;
  };
}

import fs from 'fs';
import path from 'path';

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.headers['x-user-id'] as string;
    
    // LOG TO FILE FOR DEBUGGING
    const logMsg = `[${new Date().toISOString()}] ${req.method} ${req.url} - userId: ${userId}\n`;
    fs.appendFileSync(path.join(process.cwd(), 'auth_debug.log'), logMsg);

    if (!userId) {
      fs.appendFileSync(path.join(process.cwd(), 'auth_debug.log'), `[${new Date().toISOString()}] Auth Failed: No userId header\n`);
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true }
    });

    if (!user) {
      fs.appendFileSync(path.join(process.cwd(), 'auth_debug.log'), `[${new Date().toISOString()}] Auth Failed: User ${userId} not found in DB\n`);
      return res.status(401).json({ message: 'User not found' });
    }

    fs.appendFileSync(path.join(process.cwd(), 'auth_debug.log'), `[${new Date().toISOString()}] Auth Success: User ${user.id}\n`);

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
