"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
exports.sendBookingConfirmation = sendBookingConfirmation;
exports.sendApplicationAccepted = sendApplicationAccepted;
exports.sendApplicationRejected = sendApplicationRejected;
exports.sendBookingReminder = sendBookingReminder;
exports.sendBookingCompletion = sendBookingCompletion;
exports.sendInvoiceEmail = sendInvoiceEmail;
exports.sendWelcomeEmail = sendWelcomeEmail;
exports.sendBroadcastEmail = sendBroadcastEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("./prisma"));
// Initialize SendGrid with API key from settings
let isInitialized = false;
let lastApiKey = '';
let mailtrapTransporter = null;
function initializeEmailTransport() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            // Check for Mailtrap first (as requested by user)
            const mailtrapUser = process.env.MAILTRAP_USER;
            const mailtrapPass = process.env.MAILTRAP_PASS;
            if (mailtrapUser && mailtrapPass) {
                if (!mailtrapTransporter) {
                    mailtrapTransporter = nodemailer_1.default.createTransport({
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
                    mail_1.default.setApiKey(envApiKey);
                    lastApiKey = envApiKey;
                    isInitialized = true;
                    console.log('✅ SendGrid initialized with API key from environment variable');
                }
                return;
            }
            const settings = yield prisma_1.default.systemSettings.findUnique({
                where: { id: 'default' }
            });
            if (settings && settings.integrations) {
                const integrations = settings.integrations;
                if (((_a = integrations.sendgrid) === null || _a === void 0 ? void 0 : _a.enabled) && ((_b = integrations.sendgrid) === null || _b === void 0 ? void 0 : _b.apiKey)) {
                    const currentApiKey = integrations.sendgrid.apiKey;
                    // Reinitialize if API key has changed
                    if (!isInitialized || lastApiKey !== currentApiKey) {
                        mail_1.default.setApiKey(currentApiKey);
                        lastApiKey = currentApiKey;
                        isInitialized = true;
                        console.log('✅ SendGrid initialized successfully with API key from settings:', currentApiKey.substring(0, 10) + '...');
                    }
                }
                else {
                    console.warn('⚠️ SendGrid is not enabled or API key is missing in settings');
                    isInitialized = false;
                }
            }
            else {
                console.warn('⚠️ System settings or integrations not found');
                isInitialized = false;
            }
        }
        catch (error) {
            console.error('❌ Failed to initialize SendGrid:', error);
            isInitialized = false;
        }
    });
}
// Get email template from database and replace variables
function processTemplate(template, variables) {
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
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('📧 Attempting to send email to:', options.to);
            // Initialize email transport if not already done
            yield initializeEmailTransport();
            if (!isInitialized) {
                console.warn('⚠️ Email transport not initialized, skipping email send');
                return false;
            }
            // Get notification templates from settings
            const settings = yield prisma_1.default.systemSettings.findUnique({
                where: { id: 'default' }
            });
            if (!settings || !settings.notifications) {
                console.error('❌ Notification templates not found in settings');
                return false;
            }
            const templates = settings.notifications;
            let template = templates[options.templateType];
            if (!template) {
                if (options.templateType === 'broadcast') {
                    template = "Hello {name},\n\n{message}\n\nBest regards,\nThe Sparkleville Team";
                }
                else {
                    console.error(`Template ${options.templateType} not found`);
                    return false;
                }
            }
            // Process template with variables
            const emailContent = processTemplate(template, options.variables);
            // Get company info for "from" address
            const general = settings.general;
            const fromEmail = (general === null || general === void 0 ? void 0 : general.email) || 'admin@sparkleville.co';
            const companyName = (general === null || general === void 0 ? void 0 : general.companyName) || 'Sparkleville';
            const companyAddress = (general === null || general === void 0 ? void 0 : general.address) || '';
            const companyPhone = (general === null || general === void 0 ? void 0 : general.phone) || '';
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
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #374151; }
            .email-wrapper { background-color: #f9fafb; padding: 20px 0; }
            .email-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.07); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; }
            .logo { max-width: 200px; height: auto; margin: 0 auto 15px; display: block; }
            .header-text { color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
            .tagline { color: rgba(255,255,255,0.9); font-size: 14px; margin-top: 8px; font-weight: 500; }
            .content { padding: 40px; }
            .content p { margin-bottom: 16px; color: #374151; }
            .content pre, .content-text { white-space: pre-wrap; word-wrap: break-word; }
            .button-container { text-align: center; margin: 30px 0; }
            .button { display: inline-block; padding: 12px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px; transition: transform 0.2s, box-shadow 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
            .button:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(16, 185, 129, 0.4); }
            .divider { height: 1px; background-color: #e5e7eb; margin: 30px 0; }
            .footer { background-color: #f9fafb; padding: 30px 20px; text-align: center; border-top: 1px solid #e5e7eb; }
            .footer-text { color: #6b7280; font-size: 12px; line-height: 1.8; }
            .footer-link { color: #10b981; text-decoration: none; font-weight: 500; }
            .footer-link:hover { text-decoration: underline; }
            .social-links { margin-top: 15px; }
            .social-links a { display: inline-block; margin: 0 8px; }
            .info-box { background-color: #ecfdf5; padding: 20px; border-left: 4px solid #10b981; border-radius: 4px; margin: 20px 0; font-size: 13px; }
            .credentials-box { background-color: #f0fdf4; padding: 20px; border: 1px solid #dcfce7; border-radius: 8px; margin: 20px 0; font-family: 'Courier New', monospace; font-size: 13px; }
            .credentials-label { color: #059669; font-weight: 600; margin-bottom: 8px; }
            .credentials-item { padding: 10px; background-color: #ffffff; border: 1px solid #dcfce7; border-radius: 4px; margin-bottom: 10px; word-break: break-all; }
            .credentials-item strong { color: #059669; }
            .instruction-box { background-color: #ecfdf5; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
            .instruction-box ol { padding-left: 20px; }
            .instruction-box li { margin: 10px 0; color: #374151; }
            .warning-box { background-color: #fef3c7; padding: 16px; border-left: 4px solid #f59e0b; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #92400e; }
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
                // Add headers to prevent spam filtering
                headers: {
                    'X-Priority': '3',
                    'X-MSMail-Priority': 'Normal',
                    'X-Mailer': 'Sparkleville Mail Service',
                    'List-Unsubscribe': `<${appUrl}/unsubscribe>`,
                    'List-Help': `<${appUrl}/help>`,
                }
            };
            if (mailtrapTransporter) {
                yield mailtrapTransporter.sendMail({
                    from: `"${companyName}" <${fromEmail}>`,
                    to: options.to,
                    subject: options.subject,
                    text: msg.text,
                    html: msg.html,
                });
                console.log(`✅ Email sent successfully via Mailtrap to ${options.to}`);
                return true;
            }
            yield mail_1.default.send(msg);
            console.log(`✅ Email sent successfully to ${options.to}`);
            return true;
        }
        catch (error) {
            console.error('❌ Error sending email:', error);
            if (error.response) {
                console.error('📧 SendGrid error details:', error.response.body);
            }
            return false;
        }
    });
}
// Send booking confirmation email
function sendBookingConfirmation(booking, customerEmail) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        // Format property details
        let propertyDetails = '';
        if (booking.bedrooms)
            propertyDetails += `Bedrooms: ${booking.bedrooms}, `;
        if (booking.bathrooms)
            propertyDetails += `Bathrooms: ${booking.bathrooms}, `;
        if (booking.toilets)
            propertyDetails += `Toilets: ${booking.toilets}`;
        propertyDetails = propertyDetails.replace(/, $/, '');
        // Format rooms if available
        let roomsDetails = '';
        if (booking.rooms && typeof booking.rooms === 'object') {
            roomsDetails = Object.entries(booking.rooms)
                .map(([room, quantity]) => `${room}: ${quantity}`)
                .join(', ');
        }
        // Format add-ons - handle both array and name format
        let addOnsDetails = '';
        if (booking.addOns && Array.isArray(booking.addOns) && booking.addOns.length > 0) {
            addOnsDetails = booking.addOns
                .map((addon) => typeof addon === 'object' ? addon.name : addon)
                .join(', ');
        }
        // Format kitchen add-ons if available
        let kitchenDetails = '';
        if (booking.kitchenAddOns && typeof booking.kitchenAddOns === 'object') {
            const kitchenEntries = Object.entries(booking.kitchenAddOns)
                .filter(([_, value]) => value)
                .map(([key, _]) => key);
            if (kitchenEntries.length > 0) {
                kitchenDetails = kitchenEntries.join(', ');
            }
        }
        // Format laundry details if available
        let laundryDetails = '';
        if (booking.laundryRoomDetails && typeof booking.laundryRoomDetails === 'object') {
            const laundry = booking.laundryRoomDetails;
            if (laundry.selected && laundry.selectedOptions && laundry.selectedOptions.length > 0) {
                laundryDetails = laundry.selectedOptions.join(', ');
            }
            else if ((_a = laundry[Object.keys(laundry)[0]]) === null || _a === void 0 ? void 0 : _a.selectedOptions) {
                // Alternative structure: laundry room index -> selectedOptions
                const laundryEntries = Object.entries(laundry)
                    .filter(([_, value]) => (value === null || value === void 0 ? void 0 : value.selectedOptions) && value.selectedOptions.length > 0)
                    .map(([_, value]) => value.selectedOptions.join(', '));
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
Estimated Duration: ${booking.estimatedDuration || 'TBD'} hours
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
    });
}
// Send application accepted email
function sendApplicationAccepted(application) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
// Send application rejected email
function sendApplicationRejected(application) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
// Send reminder email
function sendBookingReminder(booking, customerEmail) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
// Send completion email
function sendBookingCompletion(booking, customerEmail) {
    return __awaiter(this, void 0, void 0, function* () {
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
    });
}
// Send invoice email to customer
function sendInvoiceEmail(booking, email, total, balanceDue) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('📧 Preparing to send invoice email to:', email);
        const settings = yield prisma_1.default.systemSettings.findUnique({
            where: { id: 'default' }
        });
        const general = settings === null || settings === void 0 ? void 0 : settings.general;
        const companyName = (general === null || general === void 0 ? void 0 : general.companyName) || 'Sparkleville';
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
    });
}
// Send welcome email to new user
function sendWelcomeEmail(user, temporaryPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('📧 Preparing to send welcome email to:', user.email);
        const settings = yield prisma_1.default.systemSettings.findUnique({
            where: { id: 'default' }
        });
        const general = settings === null || settings === void 0 ? void 0 : settings.general;
        const companyName = (general === null || general === void 0 ? void 0 : general.companyName) || 'Sparkleville';
        const supportEmail = (general === null || general === void 0 ? void 0 : general.email) || 'admin@sparkleville.co';
        const appUrl = process.env.VITE_API_URL || 'https://sparkleville.co';
        // Map role to display name
        const roleMap = {
            'ADMIN': 'Administrator',
            'SUPERVISOR': 'Supervisor',
            'SUPPORT': 'Support Staff',
            'CLEANER': 'Cleaner',
            'CUSTOMER': 'Customer'
        };
        const roleDisplayName = roleMap[user.role] || user.role;
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
    });
}
function sendBroadcastEmail(target, subject, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let users = [];
            if (target === 'all') {
                users = yield prisma_1.default.user.findMany({
                    where: { email: { not: '' } },
                    select: { email: true, name: true }
                });
            }
            else if (target === 'cleaners') {
                users = yield prisma_1.default.user.findMany({
                    where: { role: client_1.Role.CLEANER, email: { not: '' } },
                    select: { email: true, name: true }
                });
            }
            else if (target === 'customers') {
                users = yield prisma_1.default.user.findMany({
                    where: { role: client_1.Role.CUSTOMER, email: { not: '' } },
                    select: { email: true, name: true }
                });
            }
            else if (target === 'staff') {
                users = yield prisma_1.default.user.findMany({
                    where: {
                        role: { in: [client_1.Role.ADMIN, client_1.Role.SUPERVISOR, client_1.Role.SUPPORT] },
                        email: { not: '' }
                    },
                    select: { email: true, name: true }
                });
            }
            console.log(`📢 Broadcasting email to ${users.length} ${target} users`);
            for (const user of users) {
                yield sendEmail({
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
        }
        catch (error) {
            console.error('Error sending broadcast email:', error);
            return false;
        }
    });
}
