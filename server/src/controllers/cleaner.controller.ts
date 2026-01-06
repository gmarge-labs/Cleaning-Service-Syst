import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { sendApplicationAccepted, sendApplicationRejected, sendEmail } from '../utils/email.service';
import { uploadBase64File } from '../utils/googleDrive';

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
      reference2State,
      agreedToBackgroundCheck,
      agreedToTerms
    } = req.body;

    // Handle Google Drive Upload for ID Document
    let driveIdUrl = idUrl;
    if (idUrl && idUrl.startsWith('data:')) {
      const now = new Date();
      const year = now.getFullYear().toString();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      
      const folderPath = ['Applicants', year, month, day, `${firstName}_${lastName}`.replace(/\s+/g, '_')];
      
      // Determine extension from base64
      const mimeType = idUrl.split(';')[0].split(':')[1];
      const extension = mimeType.split('/')[1] || 'jpg';
      
      const timestamp = new Date().getTime();
      driveIdUrl = await uploadBase64File(idUrl, `ID_Document_${timestamp}.${extension}`, folderPath);
    }

    // Using any cast for cleanerApplication as the editor's TS server might not have picked up the generated types yet
    const application = await (prisma as any).cleanerApplication.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: (dateOfBirth && !isNaN(Date.parse(dateOfBirth))) ? new Date(dateOfBirth) : new Date(),
        gender,
        address,
        city,
        state,
        zipCode,
        ssn,
        idUrl: driveIdUrl,
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
        agreedToBackgroundCheck: !!agreedToBackgroundCheck,
        agreedToTerms: !!agreedToTerms,
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

    // Send email to company
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });

    const general = settings?.general as any;
    const companyEmail = general?.email || 'admin@sparkleville.co';

    await sendEmail({
      to: companyEmail,
      subject: `New Cleaner Application: ${application.firstName} ${application.lastName}`,
      templateType: 'broadcast',
      variables: {
        name: 'Admin',
        message: `
          You have received a new cleaner application:
          
          Name: ${application.firstName} ${application.lastName}
          Email: ${application.email}
          Phone: ${application.phone}
          Location: ${application.city}, ${application.state}
          
          Please log in to the admin dashboard to review the full application.
        `
      }
    });

    res.status(201).json({
      message: 'Application submitted successfully',
      application
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
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

    // Send email notification based on status
    if (status === 'ACCEPTED') {
      await sendApplicationAccepted(application);
    } else if (status === 'REJECTED') {
      await sendApplicationRejected(application);
    }

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getCleaners = async (req: Request, res: Response) => {
  try {
    const cleaners = await prisma.user.findMany({
      where: {
        role: 'CLEANER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        address: true,
        createdAt: true,
      }
    });

    // Map profileImage to photo for compatibility
    const formattedCleaners = cleaners.map(cleaner => ({
      ...cleaner,
      photo: cleaner.profileImage,
      rating: 4.5, // Default rating - can be calculated from reviews later
      completedJobs: 0, // Can be calculated from completed bookings
    }));

    res.json(formattedCleaners);
  } catch (error) {
    console.error('Get cleaners error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
