import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { generateUserId } from '../utils/idGenerator';
import { sendWelcomeEmail } from '../utils/email.service';

const prisma = new PrismaClient();

export const getProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        addresses: {
          orderBy: { createdAt: 'desc' },
        },
        paymentMethods: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Don't send password
    const { password, ...profile } = user;
    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { name, phone, address, notificationSettings, currentPassword, newPassword } = req.body;

  try {
    // If password change is requested, validate current password first
    if (currentPassword && newPassword) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update user with new password
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          phone,
          address,
          notificationSettings,
          password: hashedPassword,
        },
      });

      const { password, ...profile } = updatedUser;
      return res.json(profile);
    }

    // Update without password change
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        phone,
        address,
        notificationSettings,
      },
    });

    const { password, ...profile } = updatedUser;
    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const changePassword = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { currentPassword, newPassword } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Address Management
export const addAddress = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { label, street, city, state, zip, isDefault } = req.body;

  try {
    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId,
        label,
        street,
        city,
        state,
        zip,
        isDefault,
      },
    });

    res.status(201).json(address);
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteAddress = async (req: Request, res: Response) => {
  const { addressId } = req.params;

  try {
    await prisma.address.delete({
      where: { id: addressId },
    });
    res.json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete address error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Payment Method Management
export const addPaymentMethod = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { type, last4, expiry, isDefault } = req.body;

  try {
    if (isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { userId },
        data: { isDefault: false },
      });
    }

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        last4,
        expiry,
        isDefault,
      },
    });

    res.status(201).json(paymentMethod);
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deletePaymentMethod = async (req: Request, res: Response) => {
  const { paymentMethodId } = req.params;

  try {
    await prisma.paymentMethod.delete({
      where: { id: paymentMethodId },
    });
    res.json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Delete payment method error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Admin User Management
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Get pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 8;
    const skip = (page - 1) * limit;
    const roleFilter = req.query.role as string; // 'CUSTOMER' for customer management, undefined for all users

    // Build where clause based on role filter
    const whereClause = roleFilter ? { role: roleFilter as any } : {};

    // Get total count
    const totalCount = await prisma.user.count({
      where: whereClause as any
    });

    // Fetch users with optional role filter
    const users = await prisma.user.findMany({
      where: whereClause as any,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        bookings: {
          select: {
            id: true,
            totalAmount: true,
            status: true,
          }
        },
        addresses: {
          where: { isDefault: true },
          take: 1,
          select: {
            street: true,
            city: true,
            state: true,
          }
        }
      }
    });

    // Transform the data to include a formatted address
    const usersWithAddress = users.map((user: any) => {
      const { password, ...userData } = user;
      const primaryAddress = user.addresses?.[0];
      return {
        ...userData,
        address: primaryAddress
          ? `${primaryAddress.street}, ${primaryAddress.city}, ${primaryAddress.state}`
          : user.address || null,
      };
    });

    // Return paginated response
    res.json({
      data: usersWithAddress,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1,
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { name, email, password, role, phone, address } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await generateUserId(role || 'CUSTOMER');

    const user = await prisma.user.create({
      data: {
        id,
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'CUSTOMER',
        phone: phone || null,
        address: address || null,
      },
    });

    // Send welcome email to the new user
    console.log('📧 User created successfully, sending welcome email...');
    const emailSent = await sendWelcomeEmail(user, password);
    if (emailSent) {
      console.log('✅ Welcome email sent successfully');
    } else {
      console.warn('⚠️ User created but welcome email failed to send');
    }

    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updatePushToken = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { pushToken } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { pushToken },
    });
    res.json({ message: 'Push token updated successfully' });
  } catch (error) {
    console.error('Update push token error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
