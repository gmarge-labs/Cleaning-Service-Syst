import prisma from './prisma';

const DEFAULT_SYSTEM_SETTINGS = {
  general: {
    companyName: 'Sparkleville',
    email: 'hello@Sparkleville.com',
    phone: '(555) 123-4567',
    address: '123 Clean Street, Suite 100',
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
    perKitchen: 45,
    perLivingRoom: 30,
    perDiningRoom: 20,
    perLaundryRoom: 20,
    perBalcony: 20,
    perBasement: 45,
    perGarage: 30,
    perHomeOffice: 20,
    perInsideFridge: 20,
    perInsideOven: 25,
    perMicrowave: 10,
    perDishes: 20,
    perLaundryBasket: 30,
    perWindow: 15,
    perPetHair: 30,
    perOrganizationHour: 60,
    standardCleaningMultiplier: 1.0,
    deepCleaningMultiplier: 1.5,
    moveInOutMultiplier: 2.0,
    postConstructionMultiplier: 2.5,
  },
  notifications: {
    confirmation: 'Dear {customer_name}, Your booking for {service_type} on {date} at {time} has been confirmed...',
    reminder: 'Hi {customer_name}, This is a reminder that your {service_type} is scheduled for tomorrow at {time}...',
    completion: 'Hi {customer_name}, Your cleaning service has been completed. We hope you\'re satisfied with the results...',
    welcome: 'Dear {customer_name}, Welcome to our platform! Your account has been created and you can now access all our services.',
    application_accepted: 'Dear {name}, Congratulations! Your application to join the Sparkleville team has been accepted. We are excited to have you on board. Our team will contact you shortly with the next steps for onboarding.',
    application_rejected: 'Dear {name}, Thank you for your interest in joining Sparkleville. After carefully reviewing your application, we regret to inform you that we will not be moving forward with your application at this time. We wish you the best in your future endeavors.',
  },
};

export interface APIConfig {
  sendgrid?: {
    enabled: boolean;
    apiKey: string;
    fromEmail?: string;
  };
  payment?: {
    enabled: boolean;
    apiKey: string;
    secretKey?: string;
    provider: 'stripe' | 'square' | 'other';
  };
  googleCalendar?: {
    enabled: boolean;
    apiKey: string;
    calendarId?: string;
    clientId?: string;
    clientSecret?: string;
    refreshToken?: string;
  };
}

export class APIConfigService {
  /**
   * Get all API configurations from database
   * Falls back to environment variables if not found
   */
  static async getConfigs(): Promise<APIConfig> {
    try {
      const settings = await prisma.systemSettings.findUnique({
        where: { id: 'default' }
      });

      if (settings?.integrations && typeof settings.integrations === 'object') {
        return settings.integrations as APIConfig;
      }

      // Fallback to environment variables
      return this.getConfigsFromEnv();
    } catch (error) {
      console.warn('Failed to fetch configs from database, using environment variables:', error);
      return this.getConfigsFromEnv();
    }
  }

  /**
   * Get specific API configuration by name
   */
  static async getConfig(name: 'sendgrid' | 'payment' | 'googleCalendar'): Promise<any> {
    const configs = await this.getConfigs();
    return configs[name] || null;
  }

  /**
   * Update API configurations in database
   * Admin only endpoint
   */
  static async updateConfigs(updates: Partial<APIConfig>): Promise<APIConfig> {
    try {
      let settings = await prisma.systemSettings.findUnique({
        where: { id: 'default' }
      });

      if (!settings) {
        // Create with defaults if doesn't exist
        settings = await prisma.systemSettings.create({
          data: {
            id: 'default',
            general: DEFAULT_SYSTEM_SETTINGS.general as any,
            pricing: DEFAULT_SYSTEM_SETTINGS.pricing as any,
            cleanerPay: DEFAULT_SYSTEM_SETTINGS.cleanerPay as any,
            servicePrices: DEFAULT_SYSTEM_SETTINGS.servicePrices as any,
            roomPrices: DEFAULT_SYSTEM_SETTINGS.roomPrices as any,
            addonPrices: DEFAULT_SYSTEM_SETTINGS.addonPrices as any,
            durationSettings: DEFAULT_SYSTEM_SETTINGS.durationSettings as any,
            notifications: DEFAULT_SYSTEM_SETTINGS.notifications as any,
            integrations: updates as any
          }
        });
      } else {
        // Merge with existing configurations
        const currentIntegrations = (settings.integrations as APIConfig) || {};
        const mergedIntegrations = {
          ...currentIntegrations,
          ...updates
        };

        settings = await prisma.systemSettings.update({
          where: { id: 'default' },
          data: {
            integrations: mergedIntegrations as any
          }
        });
      }

      return (settings.integrations as APIConfig) || {};
    } catch (error) {
      console.error('Error updating API configs:', error);
      throw new Error('Failed to update API configurations');
    }
  }

  /**
   * Update specific API configuration
   */
  static async updateConfig(
    name: 'sendgrid' | 'payment' | 'googleCalendar',
    config: any
  ): Promise<any> {
    const currentConfigs = await this.getConfigs();
    const updated = {
      ...currentConfigs,
      [name]: {
        ...currentConfigs[name as keyof APIConfig],
        ...config
      }
    };
    return this.updateConfigs(updated);
  }

  /**
   * Validate API configuration
   * Tests if API keys are working
   */
  static async validateConfig(name: 'sendgrid' | 'payment' | 'googleCalendar'): Promise<boolean> {
    const config = await this.getConfig(name);

    if (!config || !config.enabled || !config.apiKey) {
      return false;
    }

    try {
      switch (name) {
        case 'sendgrid':
          return await this.validateSendGrid(config);
        case 'payment':
          return await this.validatePayment(config);
        case 'googleCalendar':
          return await this.validateGoogleCalendar(config);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Validation failed for ${name}:`, error);
      return false;
    }
  }

  /**
   * Test SendGrid API key
   */
  private static async validateSendGrid(config: any): Promise<boolean> {
    try {
      // Basic validation - check if key format looks correct
      if (!config.apiKey.startsWith('SG.')) {
        return false;
      }

      // You can add a more thorough test by making an actual API call
      // For now, we'll just validate the format and presence
      return config.apiKey.length > 10;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test Payment provider API key
   */
  private static async validatePayment(config: any): Promise<boolean> {
    try {
      const provider = config.provider || 'stripe';

      if (provider === 'stripe') {
        // Stripe keys start with 'sk_test_' or 'sk_live_'
        if (!config.apiKey.startsWith('sk_')) {
          return false;
        }
        return config.apiKey.length > 20;
      } else if (provider === 'square') {
        // Square keys have a specific format
        return config.apiKey.length > 20;
      }

      return config.apiKey.length > 10;
    } catch (error) {
      return false;
    }
  }

  /**
   * Test Google Calendar API key/credentials
   */
  private static async validateGoogleCalendar(config: any): Promise<boolean> {
    try {
      // If using API key
      if (config.apiKey) {
        if (!config.apiKey.startsWith('AIza')) {
          return false;
        }
        return config.apiKey.length > 20;
      }

      // If using OAuth credentials
      if (config.clientId && config.clientSecret) {
        return config.clientId.length > 20 && config.clientSecret.length > 20;
      }

      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get configurations from environment variables
   * Fallback method
   */
  private static getConfigsFromEnv(): APIConfig {
    return {
      sendgrid: {
        enabled: !!process.env.SENDGRID_API_KEY,
        apiKey: process.env.SENDGRID_API_KEY || '',
        fromEmail: process.env.SENDGRID_FROM_EMAIL
      },
      payment: {
        enabled: !!process.env.STRIPE_SECRET_KEY,
        apiKey: process.env.STRIPE_SECRET_KEY || '',
        secretKey: process.env.STRIPE_SECRET_KEY,
        provider: 'stripe'
      },
      googleCalendar: {
        enabled: !!process.env.GOOGLE_CALENDAR_API_KEY,
        apiKey: process.env.GOOGLE_CALENDAR_API_KEY || '',
        calendarId: process.env.GOOGLE_CALENDAR_ID,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET
      }
    };
  }

  /**
   * Check if all critical APIs are configured
   */
  static async checkHealthStatus(): Promise<{
    sendgrid: boolean;
    payment: boolean;
    googleCalendar: boolean;
  }> {
    const configs = await this.getConfigs();

    return {
      sendgrid: !!(configs.sendgrid?.enabled && configs.sendgrid?.apiKey),
      payment: !!(configs.payment?.enabled && configs.payment?.apiKey),
      googleCalendar: !!(configs.googleCalendar?.enabled && configs.googleCalendar?.apiKey)
    };
  }
}
