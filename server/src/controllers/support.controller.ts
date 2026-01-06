import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/email.service';

const prisma = new PrismaClient();

export const submitContactForm = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }

    // 1. Save to database (optional, but good for records)
    // Check if we have a ContactMessage model, if not, we'll just send the email
    try {
      if ((prisma as any).contactMessage) {
        await (prisma as any).contactMessage.create({
          data: { name, email, phone, message }
        });
      }
    } catch (dbError) {
      console.warn('Could not save contact message to DB:', dbError);
    }

    // 2. Send email to company
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });

    const general = settings?.general as any;
    const companyEmail = general?.email || 'admin@sparkleville.co';

    await sendEmail({
      to: companyEmail,
      subject: `New Contact Form Submission from ${name}`,
      templateType: 'broadcast', // Using broadcast as a generic template
      variables: {
        name: 'Admin',
        message: `
          You have a new contact form submission:
          
          Name: ${name}
          Email: ${email}
          Phone: ${phone || 'N/A'}
          
          Message:
          ${message}
        `
      }
    });

    res.status(200).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
