import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { APIConfigService } from '../utils/api-config.service';

const DEFAULT_SETTINGS = {
  general: {
    companyName: 'Sparkleville',
    email: 'hello@Sparkleville.com',
    phone: '+12079007700',
    address: 'City: Bangor, State: Maine, County: Penobscot county',
    businessHours: '8:00 AM - 8:00 PM',
    serviceArea: '10001, 10002, 10003',
  },
  pricing: {
    depositPercentage: 20,
    topBookerEnabled: true,
    topBookerDiscount: 15,
    topBookerCategory: 'all',
    cancellationFee: 50,
  },
  cleanerPay: {
    level1: 18,
    level2: 22,
  },
  servicePrices: {
    'Standard Cleaning': 89,
    'Deep Cleaning': 159,
    'Move In/Out': 199,
    'Post-Construction': 249,
  },
  roomPrices: {
    'Bedroom': 15,
    'Bathroom': 15,
    'Toilet': 10,
    'Kitchen': 20,
    'Living Room': 20,
    'Dining Room': 15,
    'Laundry Room': 15,
    'Balcony/Patio': 15,
    'Basement': 25,
    'Garage': 20,
    'Home Office': 15,
  },
  addonPrices: {
    'Inside Windows': 25,
    'Inside Fridge': 35,
    'Inside Oven': 40,
    'Laundry Service': 30,
    'Pet Hair Removal': 25,
    'Organization': 45,
    'Dish Washing': 20,
  },
  durationSettings: {
    baseMinutes: 60,
    perBedroom: 30,
    perBathroom: 45,
    perToilet: 15,
    perOtherRoom: 20,
    // Specific Room Durations
    perKitchen: 45,
    perLivingRoom: 30,
    perDiningRoom: 20,
    perLaundryRoom: 20,
    perBalcony: 20,
    perBasement: 45,
    perGarage: 30,
    perHomeOffice: 20,
    // Kitchen Add-ons
    perInsideFridge: 20,
    perInsideOven: 25,
    perMicrowave: 10,
    perDishes: 20,
    // Laundry
    perLaundryBasket: 30,
    // General Add-ons
    perWindow: 15,
    perPetHair: 30,
    perOrganizationHour: 60,

    standardCleaningMultiplier: 1.0,
    deepCleaningMultiplier: 1.5,
    moveInOutMultiplier: 2.0,
    postConstructionMultiplier: 2.5,
  },
  integrations: {
    stripe: { enabled: true, apiKey: 'sk_test_***************' },
    plivo: { enabled: true, apiKey: 'MA***************' },
    sendgrid: { enabled: true, apiKey: 'SG.***************' },
    quickbooks: { enabled: false, apiKey: '' },
    googleCalendar: { enabled: true, apiKey: 'AIza***************' },
  },
  notifications: {
    confirmation: `Dear {customer_name},

Your booking has been successfully confirmed! Here are your booking details:

BOOKING INFORMATION
Booking ID: {booking_id}
Service Type: {service_type}
Date: {date}
Time: {time}
Location: {address}
Total Amount: {total_amount}

{booking_details}

Thank you for choosing Sparkleville for your cleaning needs. Our team is committed to providing you with professional and reliable service. If you have any questions or need to make changes to your booking, please don't hesitate to contact us.

Best regards,
The Sparkleville Team`,
    reminder: 'Hi {customer_name}, This is a reminder that your {service_type} is scheduled for tomorrow at {time}...',
    completion: 'Hi {customer_name}, Your cleaning service has been completed. We hope you\'re satisfied with the results...',
    welcome: 'Dear {customer_name}, Welcome to our Sparkleville! Your account has been created, kindly find your login details below.',
    application_accepted: 'Dear {name}, Congratulations! Your application to join the Sparkleville team has been accepted. We are excited to have you on board. Our team will contact you shortly with the next steps for onboarding.',
    application_rejected: 'Dear {name}, Thank you for your interest in joining Sparkleville. After carefully reviewing your application, we regret to inform you that we will not be moving forward with your application at this time. We wish you the best in your future endeavors.',
  }
};

export const getSettings = async (req: Request, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          id: 'default',
          ...DEFAULT_SETTINGS
        }
      });
    }

    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateSettings = async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    // Use update instead of upsert to handle partial updates correctly.
    // Prisma update will ignore undefined fields, but upsert's create block requires all fields.
    const settings = await prisma.systemSettings.update({
      where: { id: 'default' },
      data: updates
    });

    res.json(settings);
  } catch (error: any) {
    if (error.code === 'P2025') {
      // Record not found, create it with defaults merged with updates
      try {
        const settings = await prisma.systemSettings.create({
          data: {
            id: 'default',
            ...DEFAULT_SETTINGS,
            ...req.body
          }
        });
        return res.json(settings);
      } catch (createError) {
        console.error('Create settings error:', createError);
        return res.status(500).json({ message: 'Failed to create settings' });
      }
    }
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getQualifiedUsersCount = async (req: Request, res: Response) => {
  const { category } = req.query;

  try {
    let count = 0;

    if (category === 'all') {
      count = await prisma.user.count({
        where: { role: 'CUSTOMER' }
      });
    } else {
      let min = 0;
      let max = 999999;

      if (category === '5-9') { min = 5; max = 9; }
      else if (category === '10-15') { min = 10; max = 15; }
      else if (category === '16-20') { min = 16; max = 20; }
      else if (category === '21+') { min = 21; }

      const users = await prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        select: {
          _count: {
            select: { bookings: true }
          }
        }
      });

      count = users.filter(u => u._count.bookings >= min && u._count.bookings <= max).length;
    }

    res.json({ count });
  } catch (error) {
    console.error('Get qualified users count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get all API configurations
 * Admin endpoint
 */
export const getAPIConfigs = async (req: Request, res: Response) => {
  try {
    const configs = await APIConfigService.getConfigs();
    
    // Mask sensitive data before sending to client
    const maskedConfigs = {
      sendgrid: configs.sendgrid ? {
        enabled: configs.sendgrid.enabled,
        apiKey: configs.sendgrid.apiKey ? `${configs.sendgrid.apiKey.substring(0, 10)}...` : '',
        fromEmail: configs.sendgrid.fromEmail,
        configured: !!configs.sendgrid.apiKey
      } : null,
      payment: configs.payment ? {
        enabled: configs.payment.enabled,
        apiKey: configs.payment.apiKey ? `${configs.payment.apiKey.substring(0, 10)}...` : '',
        provider: configs.payment.provider,
        configured: !!configs.payment.apiKey
      } : null,
      googleCalendar: configs.googleCalendar ? {
        enabled: configs.googleCalendar.enabled,
        apiKey: configs.googleCalendar.apiKey ? `${configs.googleCalendar.apiKey.substring(0, 10)}...` : '',
        calendarId: configs.googleCalendar.calendarId,
        configured: !!configs.googleCalendar.apiKey
      } : null
    };

    res.json(maskedConfigs);
  } catch (error) {
    console.error('Get API configs error:', error);
    res.status(500).json({ message: 'Failed to retrieve API configurations' });
  }
};

/**
 * Get specific API configuration
 * Admin endpoint
 */
export const getAPIConfig = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    
    if (!['sendgrid', 'payment', 'googleCalendar'].includes(name)) {
      return res.status(400).json({ message: 'Invalid API name' });
    }

    const config = await APIConfigService.getConfig(name as any);
    
    if (!config) {
      return res.json({ configured: false });
    }

    // Mask sensitive data
    return res.json({
      ...config,
      apiKey: config.apiKey ? `${config.apiKey.substring(0, 10)}...` : '',
      secretKey: config.secretKey ? `${config.secretKey.substring(0, 10)}...` : '',
      configured: !!config.apiKey
    });
  } catch (error) {
    console.error('Get API config error:', error);
    res.status(500).json({ message: 'Failed to retrieve API configuration' });
  }
};

/**
 * Update API configuration
 * Admin endpoint
 */
export const updateAPIConfig = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;
    const updates = req.body;

    if (!['sendgrid', 'payment', 'googleCalendar'].includes(name)) {
      return res.status(400).json({ message: 'Invalid API name' });
    }

    const updated = await APIConfigService.updateConfig(name as any, updates);
    
    // Get the specific config for this service
    const config = updated[name as keyof typeof updated];

    // Mask sensitive data in response
    const maskedResponse = {
      ...config,
      apiKey: config?.apiKey ? `${config.apiKey.substring(0, 10)}...` : '',
      secretKey: config?.secretKey ? `${config.secretKey.substring(0, 10)}...` : '',
      configured: !!config?.apiKey
    };

    res.json(maskedResponse);
  } catch (error) {
    console.error('Update API config error:', error);
    res.status(500).json({ message: 'Failed to update API configuration' });
  }
};

/**
 * Test API configuration
 * Admin endpoint - validates if API keys are working
 */
export const testAPIConfig = async (req: Request, res: Response) => {
  try {
    const { name } = req.params;

    if (!['sendgrid', 'payment', 'googleCalendar'].includes(name)) {
      return res.status(400).json({ message: 'Invalid API name' });
    }

    const isValid = await APIConfigService.validateConfig(name as any);

    res.json({
      service: name,
      valid: isValid,
      message: isValid ? `${name} configuration is valid` : `${name} configuration is invalid or incomplete`
    });
  } catch (error) {
    console.error('Test API config error:', error);
    res.status(500).json({ message: 'Failed to test API configuration' });
  }
};

/**
 * Get health status of all API integrations
 * Admin endpoint
 */
export const getIntegrationHealth = async (req: Request, res: Response) => {
  try {
    const health = await APIConfigService.checkHealthStatus();
    
    res.json({
      status: health.sendgrid && health.payment && health.googleCalendar ? 'healthy' : 'degraded',
      services: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Get integration health error:', error);
    res.status(500).json({ message: 'Failed to check integration health' });
  }
};
