import sgMail from '@sendgrid/mail';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

interface EmailOptions {
  to: string;
  subject: string;
  templateType: 'confirmation' | 'reminder' | 'completion' | 'welcome' | 'broadcast' | 'application_accepted' | 'application_rejected';
  variables: Record<string, string>;
}

// Initialize SendGrid with API key from settings
let isInitialized = false;
let lastApiKey = '';

async function initializeSendGrid() {
  try {
    // Check environment variable first
    const envApiKey = process.env.SENDGRID_API_KEY;
    if (envApiKey && envApiKey !== 'your_sendgrid_api_key') {
      if (!isInitialized || lastApiKey !== envApiKey) {
        sgMail.setApiKey(envApiKey);
        lastApiKey = envApiKey;
        isInitialized = true;
        console.log('✅ SendGrid initialized with API key from environment variable');
      }
      return;
    }

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
          console.log('✅ SendGrid initialized successfully with API key from settings:', currentApiKey.substring(0, 10) + '...');
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
  
  // Replace all {variable_name} and {{variable_name}} placeholders with actual values
  Object.keys(variables).forEach(key => {
    const value = variables[key] || '';
    // Handle {key}
    processed = processed.replace(new RegExp(`{${key}}`, 'g'), value);
    // Handle {{key}}
    processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), value);
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
    let template = templates[options.templateType];

    if (!template) {
      if (options.templateType === 'broadcast') {
        template = "Hello {name},\n\n{message}\n\nBest regards,\nThe Sparkleville Team";
      } else {
        console.error(`Template ${options.templateType} not found`);
        return false;
      }
    }

    // Process template with variables
    const emailContent = processTemplate(template, options.variables);

    // Get company info for "from" address
    const general = settings.general as any;
    const fromEmail = general?.email || 'hello@Sparkleville.com';
    const companyName = general?.companyName || 'Sparkleville';
    const companyAddress = general?.address || '';
    const companyPhone = general?.phone || '';

    console.log(`📤 Sending email from: ${fromEmail} (${companyName}) to: ${options.to}`);

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
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            .email-container { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; }
            .header { background: linear-gradient(135deg, #7C3AED 0%, #EC4899 100%); padding: 40px 20px; text-align: center; border-radius: 12px 12px 0 0; }
            .content { background: white; padding: 40px; border: 1px solid #e5e7eb; border-radius: 0 0 12px 12px; line-height: 1.6; color: #374151; }
            .footer { margin-top: 30px; padding: 20px; text-align: center; color: #6b7280; font-size: 12px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #7C3AED; color: white; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
            .info-box { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <h1 style="color: white; margin: 0; font-size: 28px; letter-spacing: -0.025em;">${companyName}</h1>
            </div>
            <div class="content">
              <div style="white-space: pre-wrap;">${emailContent.replace(/\n/g, '<br>')}</div>
              
              <div style="margin-top: 30px; text-align: center;">
                <a href="https://Sparkleville.com/login" class="button">View Your Dashboard</a>
              </div>
            </div>
            <div class="footer">
              <p><strong>${companyName}</strong></p>
              ${companyAddress ? `<p>${companyAddress}</p>` : ''}
              ${companyPhone ? `<p>${companyPhone}</p>` : ''}
              <p>You received this email because you have an account with ${companyName}.</p>
              <p style="margin-top: 10px;">© ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
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
      name: booking.guestName || 'Valued Customer',
      service_type: booking.serviceType,
      service: booking.serviceType,
      date: new Date(booking.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: booking.time,
      address: booking.address || 'Your specified location',
      booking_id: booking.id,
      total_amount: `$${Number(booking.totalAmount).toFixed(2)}`
    }
  });
}

// Send application accepted email
export async function sendApplicationAccepted(application: any) {
  return sendEmail({
    to: application.email,
    subject: 'Congratulations! Your Cleaner Application has been Accepted',
    templateType: 'application_accepted',
    variables: {
      name: `${application.firstName} ${application.lastName}`,
      first_name: application.firstName,
      last_name: application.lastName
    }
  });
}

// Send application rejected email
export async function sendApplicationRejected(application: any) {
  return sendEmail({
    to: application.email,
    subject: 'Update regarding your Cleaner Application',
    templateType: 'application_rejected',
    variables: {
      name: `${application.firstName} ${application.lastName}`,
      first_name: application.firstName,
      last_name: application.lastName
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

// Send invoice email to customer
export async function sendInvoiceEmail(booking: any, email: string, total: number, balanceDue: number) {
  console.log('📧 Preparing to send invoice email to:', email);
  
  const settings = await prisma.systemSettings.findUnique({
    where: { id: 'default' }
  });

  const general = settings?.general as any;
  const companyName = general?.companyName || 'Sparkleville';

  return sendEmail({
    to: email,
    subject: `Invoice for your ${booking.serviceType} - ${companyName}`,
    templateType: 'confirmation', // Reusing confirmation template for now, or could add 'invoice'
    variables: {
      customer_name: booking.guestName || 'Customer',
      service_type: booking.serviceType,
      date: new Date(booking.date).toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: booking.time,
      total_amount: total.toFixed(2),
      balance_due: balanceDue.toFixed(2),
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
  const companyName = general?.companyName || 'Sparkleville';
  const supportEmail = general?.email || 'hello@Sparkleville.com';

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
      name: user.name,
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

export async function sendBroadcastEmail(target: string, subject: string, message: string) {
  try {
    let users: any[] = [];
    
    if (target === 'all') {
      users = await prisma.user.findMany({
        where: { email: { not: '' } },
        select: { email: true, name: true }
      });
    } else if (target === 'cleaners') {
      users = await prisma.user.findMany({
        where: { role: Role.CLEANER, email: { not: '' } },
        select: { email: true, name: true }
      });
    } else if (target === 'customers') {
      users = await prisma.user.findMany({
        where: { role: Role.CUSTOMER, email: { not: '' } },
        select: { email: true, name: true }
      });
    } else if (target === 'staff') {
      users = await prisma.user.findMany({
        where: { 
          role: { in: [Role.ADMIN, Role.SUPERVISOR, Role.SUPPORT] },
          email: { not: '' } 
        },
        select: { email: true, name: true }
      });
    }

    console.log(`📢 Broadcasting email to ${users.length} ${target} users`);

    for (const user of users) {
      await sendEmail({
        to: user.email,
        subject: subject,
        templateType: 'broadcast',
        variables: {
          name: user.name,
          message: message
        }
      });
    }
    return true;
  } catch (error) {
    console.error('Error sending broadcast email:', error);
    return false;
  }
}
