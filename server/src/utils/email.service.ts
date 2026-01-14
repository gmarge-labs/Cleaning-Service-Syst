import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { Role } from '@prisma/client';
import prisma from './prisma';

interface EmailOptions {
  to: string;
  subject: string;
  templateType: 'confirmation' | 'reminder' | 'completion' | 'welcome' | 'broadcast' | 'application_accepted' | 'application_rejected';
  variables: Record<string, string>;
}

// Initialize SendGrid with API key from settings
let isInitialized = false;
let lastApiKey = '';
let mailtrapTransporter: nodemailer.Transporter | null = null;

async function initializeEmailTransport() {
  try {
    // Check for Mailtrap first (as requested by user)
    const mailtrapUser = process.env.MAILTRAP_USER;
    const mailtrapPass = process.env.MAILTRAP_PASS;

    if (mailtrapUser && mailtrapPass) {
      if (!mailtrapTransporter) {
        mailtrapTransporter = nodemailer.createTransport({
          host: "sandbox.smtp.mailtrap.io",
          port: 2525,
          auth: {
            user: mailtrapUser,
            pass: mailtrapPass
          }
        });
        console.log('✅ Mailtrap transporter initialized');
      }
      isInitialized = true;
      return;
    }

    // Fallback to SendGrid
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
    
    // Initialize email transport if not already done
    await initializeEmailTransport();

    if (!isInitialized) {
      console.warn('⚠️ Email transport not initialized, skipping email send');
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
    const fromEmail = general?.email || 'admin@sparkleville.co';
    const companyName = general?.companyName || 'Sparkleville';
    const companyAddress = general?.address || '';
    const companyPhone = general?.phone || '';
    const logoUrl = options.variables.logo_url || 'https://sparkleville.co/logo.png';
    const appUrl = options.variables.app_url || 'https://sparkleville.co';

    console.log(`📤 Sending email from: ${fromEmail} (${companyName}) to: ${options.to}`);

    // Send email with enhanced HTML styling and logo
    const msg = {
      to: options.to,
      from: {
        email: fromEmail,
        name: companyName
      },
      replyTo: {
        email: fromEmail,
        name: companyName
      },
      subject: options.subject,
      text: emailContent,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; background-color: #f9fafb; }
            .email-wrapper { background-color: #f9fafb; padding: 20px 0; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
            .logo { max-width: 200px; height: auto; margin: 0 auto 15px; display: block; }
            .header-text { color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
            .tagline { color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 8px; font-weight: 500; }
            .content { padding: 40px 30px; background-color: #ffffff; }
            .content p { margin-bottom: 16px; color: #374151; font-size: 15px; }
            .content pre, .content-text { white-space: pre-wrap; word-wrap: break-word; font-size: 15px; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff !important; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
            .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
            .footer { background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { color: #6b7280; font-size: 13px; line-height: 1.8; }
            .footer-link { color: #10b981; text-decoration: none; font-weight: 500; }
            .info-box { background-color: #ecfdf5; padding: 20px; border-left: 4px solid #10b981; border-radius: 4px; margin: 20px 0; font-size: 14px; }
            .credentials-box { background-color: #f0fdf4; padding: 20px; border: 1px solid #dcfce7; border-radius: 8px; margin: 20px 0; font-family: 'Courier New', monospace; font-size: 14px; }
            .credentials-label { color: #059669; font-weight: 600; margin-bottom: 8px; font-size: 15px; }
            .credentials-item { padding: 12px; background-color: #ffffff; border: 1px solid #dcfce7; border-radius: 4px; margin-bottom: 10px; word-break: break-all; }
            .credentials-item strong { color: #059669; }
            .instruction-box { background-color: #ecfdf5; padding: 18px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .instruction-box ol { padding-left: 20px; margin-top: 10px; }
            .instruction-box li { margin: 10px 0; color: #374151; font-size: 14px; }
            .warning-box { background-color: #fef3c7; padding: 18px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0; font-size: 14px; color: #92400e; }
            @media only screen and (max-width: 600px) {
              .content { padding: 30px 20px !important; }
              .button { padding: 12px 28px !important; font-size: 14px !important; }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-container">
              <!-- Header with Logo and Branding -->
              <div class="header">
                <img src="${logoUrl}" alt="${companyName}" class="logo" style="max-width: 180px;">
                <h1 class="header-text">${companyName}</h1>
                <p class="tagline">Professional Cleaning Services Platform</p>
              </div>

              <!-- Main Content -->
              <div class="content">
                <div class="content-text">${emailContent.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</div>

                ${options.variables.email_type === 'welcome' ? `
                  <!-- Login Credentials Section -->
                  <div class="credentials-box">
                    <div class="credentials-label">🔐 Your Login Credentials</div>
                    <div class="credentials-item">
                      <strong>Email:</strong> ${options.variables.email}
                    </div>
                    <div class="credentials-item">
                      <strong>Temporary Password:</strong> ${options.variables.temp_password}
                    </div>
                    <div class="credentials-item">
                      <strong>Your Role:</strong> ${options.variables.user_role}
                    </div>
                  </div>

                  <!-- Instructions -->
                  <div class="instruction-box">
                    <div class="credentials-label">📋 Next Steps to Activate Your Account</div>
                    <ol>
                      <li><strong>Log in</strong> to your account using the credentials above</li>
                      <li><strong>Update your profile</strong> with complete information</li>
                      <li><strong>Change your password</strong> to something secure and unique</li>
                      <li><strong>Complete account activation</strong> by verifying your email and phone</li>
                    </ol>
                  </div>

                  <!-- Warning Box -->
                  <div class="warning-box">
                    <strong>⚠️ Security Notice:</strong> The temporary password above will expire in 24 hours. Please log in and change it immediately. Never share your password with anyone.
                  </div>
                ` : ''}

                <div class="button-container">
                  <a href="${appUrl}/login" class="button">Log In to Your Account</a>
                </div>
              </div>

              <!-- Footer -->
              <div class="footer">
                <p class="footer-text">
                  <strong>${companyName}</strong><br>
                  ${companyAddress ? `${companyAddress}<br>` : ''}
                  ${companyPhone ? `📞 ${companyPhone}<br>` : ''}
                  <a href="mailto:${fromEmail}" class="footer-link">${fromEmail}</a>
                </p>

                <div class="social-links">
                  <a href="${appUrl}" style="color: #10b981; text-decoration: none;">Website</a> •
                  <a href="mailto:${fromEmail}" style="color: #10b981; text-decoration: none;">Support</a>
                </div>

                <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                  <p class="footer-text">
                    © ${new Date().getFullYear()} ${companyName}. All rights reserved.<br>
                    You received this email because you have an account with ${companyName}.
                  </p>
                  <p class="footer-text" style="margin-top: 10px; font-size: 11px;">
                    <a href="${appUrl}/unsubscribe" class="footer-link">Unsubscribe</a> • 
                    <a href="${appUrl}/privacy" class="footer-link">Privacy Policy</a> •
                    <a href="${appUrl}/terms" class="footer-link">Terms of Service</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      // Enhanced headers to prevent spam filtering and improve deliverability
      headers: {
        'X-Priority': (options.templateType === 'welcome' || options.templateType === 'confirmation') ? '1' : '3' as any,
        'X-MSMail-Priority': (options.templateType === 'welcome' || options.templateType === 'confirmation') ? 'High' : 'Normal' as any,
        'Importance': (options.templateType === 'welcome' || options.templateType === 'confirmation') ? 'high' : 'Normal' as any,
        'X-Mailer': `${companyName} Mail Service v1.0` as any,
        'List-Unsubscribe': `<${appUrl}/unsubscribe>` as any,
        'List-Help': `<${appUrl}/help>` as any,
        'List-Id': `<notifications.${fromEmail.split('@')[1]}>` as any,
        'Precedence': (options.templateType === 'welcome' || options.templateType === 'confirmation') ? 'list' : 'bulk' as any,
        'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply' as any,
      } as any,
      // Add tracking settings to prevent spam
      trackingSettings: {
        clickTracking: {
          enable: false,
          enableText: false
        },
        openTracking: {
          enable: false
        },
        subscriptionTracking: {
          enable: false
        }
      },
      // Add mail settings
      mailSettings: {
        sandboxMode: {
          enable: false
        },
        footer: {
          enable: false
        }
      },
      // Add categories for better organization - transactional first for welcome/confirmation emails
      categories: (options.templateType === 'welcome' || options.templateType === 'confirmation') 
        ? ['transactional', options.templateType] 
        : [options.templateType, 'transactional']
    };

    if (mailtrapTransporter) {
      await mailtrapTransporter.sendMail({
        from: `"${companyName}" <${fromEmail}>`,
        to: options.to,
        subject: options.subject,
        text: msg.text,
        html: msg.html,
      });
      console.log(`✅ Email sent successfully via Mailtrap to ${options.to}`);
      return true;
    }

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
  // Format property details
  let propertyDetails = '';
  if (booking.bedrooms) propertyDetails += `Bedrooms: ${booking.bedrooms}, `;
  if (booking.bathrooms) propertyDetails += `Bathrooms: ${booking.bathrooms}, `;
  if (booking.toilets) propertyDetails += `Toilets: ${booking.toilets}`;
  propertyDetails = propertyDetails.replace(/, $/, '');

  // Format rooms if available
  let roomsDetails = '';
  if (booking.rooms && typeof booking.rooms === 'object') {
    roomsDetails = Object.entries(booking.rooms)
      .map(([room, quantity]: [string, any]) => `${room}: ${quantity}`)
      .join(', ');
  }

  // Format add-ons - handle both array and name format
  let addOnsDetails = '';
  if (booking.addOns && Array.isArray(booking.addOns) && booking.addOns.length > 0) {
    addOnsDetails = booking.addOns
      .map((addon: any) => typeof addon === 'object' ? addon.name : addon)
      .join(', ');
  }

  // Format kitchen add-ons if available
  let kitchenDetails = '';
  if (booking.kitchenAddOns && typeof booking.kitchenAddOns === 'object') {
    const kitchenEntries = Object.entries(booking.kitchenAddOns)
      .filter(([_, value]: [string, any]) => value)
      .map(([key, _]: [string, any]) => key);
    if (kitchenEntries.length > 0) {
      kitchenDetails = kitchenEntries.join(', ');
    }
  }

  // Format laundry details if available
  let laundryDetails = '';
  if (booking.laundryRoomDetails && typeof booking.laundryRoomDetails === 'object') {
    const laundry = booking.laundryRoomDetails as any;
    if (laundry.selected && laundry.selectedOptions && laundry.selectedOptions.length > 0) {
      laundryDetails = laundry.selectedOptions.join(', ');
    } else if (laundry[Object.keys(laundry)[0]]?.selectedOptions) {
      // Alternative structure: laundry room index -> selectedOptions
      const laundryEntries = Object.entries(laundry)
        .filter(([_, value]: [string, any]) => value?.selectedOptions && value.selectedOptions.length > 0)
        .map(([_, value]: [string, any]) => value.selectedOptions.join(', '));
      laundryDetails = laundryEntries.join('; ');
    }
  }

  // Format pet details
  let petDetails = '';
  if (booking.hasPet && booking.petDetails) {
    const petType = booking.petDetails.type || 'Pet';
    const petDesc = booking.petDetails.description || '';
    petDetails = `${petType}${petDesc ? ' - ' + petDesc : ''}`;
  }

  // Build comprehensive booking details summary
  let bookingDetails = `
=== BOOKING CONFIRMATION ===

Booking ID: ${booking.id}

--- SERVICE DETAILS ---
Service Type: ${booking.serviceType}
Property Type: ${booking.propertyType || 'Not specified'}
${propertyDetails ? `Property Size: ${propertyDetails}` : ''}
${roomsDetails ? `\nRooms to be cleaned:\n${roomsDetails}` : ''}
${booking.frequency ? `\nFrequency: ${booking.frequency}` : ''}

--- SCHEDULING ---
Date: ${new Date(booking.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}
Time: ${booking.time || 'Not specified'}
Location: ${booking.address || 'Your specified location'}

--- SERVICES INCLUDED ---
${addOnsDetails ? `Add-ons: ${addOnsDetails}` : 'Standard cleaning services'}
${kitchenDetails ? `Kitchen Services: ${kitchenDetails}\n` : ''}${laundryDetails ? `Laundry Services: ${laundryDetails}\n` : ''}${petDetails ? `Pet Handling: ${petDetails}\n` : ''}${booking.specialInstructions ? `Special Instructions: ${booking.specialInstructions}\n` : ''}

--- APPOINTMENT DETAILS ---
Cleaner(s) Assigned: ${booking.cleanerCount || 1}
--- PAYMENT DETAILS ---
Subtotal: $${Number(booking.totalAmount - (booking.tipAmount || 0)).toFixed(2)}
Tip: $${Number(booking.tipAmount || 0).toFixed(2)}
Total Amount: $${Number(booking.totalAmount).toFixed(2)}
Payment Method: ${booking.paymentMethod || 'To be determined'}

===========================
`;

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
      time: booking.time || 'Not specified',
      address: booking.address || 'Your specified location',
      booking_id: booking.id,
      total_amount: `$${Number(booking.totalAmount).toFixed(2)}`,
      booking_details: bookingDetails
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
      time: booking.time || 'Not specified',
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
  const supportEmail = general?.email || 'admin@sparkleville.co';
  const appUrl = process.env.VITE_API_URL || 'https://sparkleville.co';

  // Map role to display name
  const roleMap: { [key: string]: string } = {
    'ADMIN': 'Administrator',
    'SUPERVISOR': 'Supervisor',
    'SUPPORT': 'Support Staff',
    'CLEANER': 'Cleaner',
    'CUSTOMER': 'Customer'
  };
  const roleDisplayName = roleMap[user.role as string] || user.role;

  let welcomeMessage = `Dear ${user.name},

Welcome to ${companyName}! 🎉

Your account has been successfully created. You can now log in to access your dashboard and manage your profile.

Your Account Information:
• Name: ${user.name}
• Email: ${user.email}
• Role: ${roleDisplayName}
• Status: Account Activation Required

Please use the login credentials provided below to access your account.`;

  return sendEmail({
    to: user.email,
    subject: `Welcome to ${companyName}! Activate Your Account`,
    templateType: 'welcome',
    variables: {
      customer_name: user.name,
      name: user.name,
      email: user.email,
      temp_password: temporaryPassword || 'Check admin panel for credentials',
      user_role: roleDisplayName,
      email_type: 'welcome',
      app_url: appUrl,
      logo_url: 'https://sparkleville.co/logo.png',
      service_type: 'Account Created'
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
