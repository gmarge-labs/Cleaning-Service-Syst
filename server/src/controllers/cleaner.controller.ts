import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const submitApplication = async (req: Request, res: Response) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      address,
      city,
      state,
      zipCode,
      ssn,
      idUrl,
      reference1Name,
      reference1Phone,
      reference1Relationship,
      reference1RelationshipOther,
      reference1Address,
      reference1City,
      reference1State,
      reference2Name,
      reference2Phone,
      reference2Relationship,
      reference2RelationshipOther,
      reference2Address,
      reference2City,
      reference2State
    } = req.body;
    
    // Using any cast for cleanerApplication as the editor's TS server might not have picked up the generated types yet
    const application = await (prisma as any).cleanerApplication.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
        gender,
        address,
        city,
        state,
        zipCode,
        ssn,
        idUrl,
        reference1Name,
        reference1Phone,
        reference1Relationship,
        reference1RelationshipOther,
        reference1Address,
        reference1City,
        reference1State,
        reference2Name,
        reference2Phone,
        reference2Relationship,
        reference2RelationshipOther,
        reference2Address,
        reference2City,
        reference2State,
        status: 'PENDING'
      },
    });

    // Create a notification for admins
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    for (const admin of admins) {
      await prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'cleaner_application',
          title: 'New Cleaner Application',
          message: `New application from ${application.firstName} ${application.lastName}`,
          data: {
            applicationId: application.id,
            applicantName: `${application.firstName} ${application.lastName}`
          }
        }
      });
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getApplications = async (req: Request, res: Response) => {
  try {
    const applications = await (prisma as any).cleanerApplication.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateApplicationStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const application = await (prisma as any).cleanerApplication.update({
      where: { id },
      data: { status }
    });

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
