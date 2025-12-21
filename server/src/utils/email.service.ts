import sgMail from '@sendgrid/mail';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailOptions {
  to: string;
  subject: string;
  templateType: 'confirmation' | 'reminder' | 'completion' | 'welcome';
  variables: Record<string, string>;
}

// Initialize SendGrid with API key from settings
let isInitialized = false;
let lastApiKey = '';

async function initializeSendGrid() {
  try {
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });

    if (settings && settings.integrations) {
      const integrations = settings.integrations as any;
      if (integrations.sendgrid?.enabled && integrations.sendgrid?.apiKey) {
        const currentApiKey = integrations.sendgrid.apiKey;
        
        // Reinitialize if API key has changed
        if (!isInitialized || lastApiKey !== currentApiKey) {
          sgMail.setApiKey(currentApiKey);
          lastApiKey = currentApiKey;
          isInitialized = true;
          console.log('✅ SendGrid initialized successfully with API key:', currentApiKey.substring(0, 10) + '...');
        }
      } else {
        console.warn('⚠️ SendGrid is not enabled or API key is missing in settings');
        isInitialized = false;
      }
    } else {
      console.warn('⚠️ System settings or integrations not found');
      isInitialized = false;
    }
  } catch (error) {
    console.error('❌ Failed to initialize SendGrid:', error);
    isInitialized = false;
  }
}

// Get email template from database and replace variables
function processTemplate(template: string, variables: Record<string, string>): string {
  let processed = template;
  
  // Replace all {variable_name} placeholders with actual values
  Object.keys(variables).forEach(key => {
    const placeholder = `{${key}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), variables[key]);
  });
  
  return processed;
}

// Send email using SendGrid
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    console.log('📧 Attempting to send email to:', options.to);
    
    // Initialize SendGrid if not already done
    await initializeSendGrid();

    if (!isInitialized) {
      console.warn('⚠️ SendGrid not initialized, skipping email send');
      return false;
    }

    // Get notification templates from settings
    const settings = await prisma.systemSettings.findUnique({
      where: { id: 'default' }
    });

    if (!settings || !settings.notifications) {
      console.error('❌ Notification templates not found in settings');
      return false;
    }

    const templates = settings.notifications as any;
    const template = templates[options.templateType];

    if (!template) {
      console.error(`Template ${options.templateType} not found`);
      return false;
    }

    // Process template with variables
    const emailContent = processTemplate(template, options.variables);

    // Get company info for "from" address
    const general = settings.general as any;
    const fromEmail = general?.email || 'hello@sparkleville.com';
    const companyName = general?.companyName || 'SparkleVille';

    // Send email
    const msg = {
      to: options.to,
      from: {
        email: fromEmail,
        name: companyName
      },
      subject: options.subject,
      text: emailContent,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">${companyName}</h1>
          </div>
          <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px;">
            <div style="white-space: pre-wrap; line-height: 1.6; color: #374151;">
              ${emailContent.replace(/\n/g, '<br>')}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 14px;">
              <p>Need help? Contact us at ${fromEmail}</p>
              <p style="margin-top: 10px;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email sent successfully to ${options.to}`);
    return true;

  } catch (error: any) {
    console.error('❌ Error sending email:', error);
    if (error.response) {
      console.error('📧 SendGrid error details:', error.response.body);
    }
    return false;
  }
}

// Send booking confirmation email
export async function sendBookingConfirmation(booking: any, customerEmail: string) {
  return sendEmail({
    to: customerEmail,
    subject: 'Booking Confirmation - Your Service is Scheduled',
    templateType: 'confirmation',
    variables: {
      customer_name: booking.guestName || 'Valued Customer',
      service_type: booking.serviceType,
      date: new Date(booking.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: booking.time,
      address: booking.address || 'Your specified location',
      booking_id: booking.id,
      total_amount: `$${booking.totalAmount.toFixed(2)}`
    }
  });
}

// Send reminder email
export async function sendBookingReminder(booking: any, customerEmail: string) {
  return sendEmail({
    to: customerEmail,
    subject: 'Reminder: Your Cleaning Service Tomorrow',
    templateType: 'reminder',
    variables: {
      customer_name: booking.guestName || 'Valued Customer',
      service_type: booking.serviceType,
      date: new Date(booking.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: booking.time,
      address: booking.address || 'Your specified location',
      booking_id: booking.id
    }
  });
}

// Send completion email
export async function sendBookingCompletion(booking: any, customerEmail: string) {
  return sendEmail({
    to: customerEmail,
    subject: 'Service Completed - Thank You!',
    templateType: 'completion',
    variables: {
      customer_name: booking.guestName || 'Valued Customer',
      service_type: booking.serviceType,
      date: new Date(booking.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      booking_id: booking.id
    }
  });
}

// Send welcome email to new user
export async function sendWelcomeEmail(user: any, temporaryPassword?: string) {
  console.log('📧 Preparing to send welcome email to:', user.email);
  
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  });

  const general = settings?.general as any;
  const companyName = general?.companyName || 'SparkleVille';
  const supportEmail = general?.email || 'hello@sparkleville.com';

  let welcomeMessage = `Dear ${user.name},

Welcome to ${companyName}! Your account has been successfully created.

Account Details:
- Name: ${user.name}
- Email: ${user.email}
- Role: ${user.role}`;

  if (temporaryPassword) {
    welcomeMessage += `\n- Temporary Password: ${temporaryPassword}\n\n⚠️ Please change your password after your first login for security.`;
  }

  welcomeMessage += `\n\nYou can now log in to your account and start using our services.

If you have any questions, feel free to reach out to us at ${supportEmail}.

Best regards,
The ${companyName} Team`;

  return sendEmail({
    to: user.email,
    subject: `Welcome to ${companyName}!`,
    templateType: 'welcome',
    variables: {
      customer_name: user.name,
      service_type: 'Account Created',
      date: new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: new Date().toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }
  });
}
