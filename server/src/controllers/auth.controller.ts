
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient, Role } from '../generated/prisma/client';
import { generateUserId } from '../utils/idGenerator';

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user exists
    const emailLower = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Validate role if provided, default to CUSTOMER
    let userRole: Role = Role.CUSTOMER;
    if (role && Object.values(Role).includes(role)) {
      userRole = role as Role;
    }

    // Generate custom ID
    const id = await generateUserId(userRole);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id,
        name,
        email: emailLower,
        password: hashedPassword,
        role: userRole,
      },
    });

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User created successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//function for login
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const emailLower = email.toLowerCase();
    console.log(`Attempting login for: ${emailLower}`);
    
    const user = await prisma.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      console.log(`User not found: ${emailLower}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log(`Password valid for ${emailLower}: ${isPasswordValid}`);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
