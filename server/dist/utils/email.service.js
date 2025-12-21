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
exports.sendBookingReminder = sendBookingReminder;
exports.sendBookingCompletion = sendBookingCompletion;
exports.sendWelcomeEmail = sendWelcomeEmail;
const mail_1 = __importDefault(require("@sendgrid/mail"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Initialize SendGrid with API key from settings
let isInitialized = false;
let lastApiKey = '';
function initializeSendGrid() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            const settings = yield prisma.systemSettings.findUnique({
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
                        console.log('✅ SendGrid initialized successfully with API key:', currentApiKey.substring(0, 10) + '...');
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
    // Replace all {variable_name} placeholders with actual values
    Object.keys(variables).forEach(key => {
        const placeholder = `{${key}}`;
        processed = processed.replace(new RegExp(placeholder, 'g'), variables[key]);
    });
    return processed;
}
// Send email using SendGrid
function sendEmail(options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('📧 Attempting to send email to:', options.to);
            // Initialize SendGrid if not already done
            yield initializeSendGrid();
            if (!isInitialized) {
                console.warn('⚠️ SendGrid not initialized, skipping email send');
                return false;
            }
            // Get notification templates from settings
            const settings = yield prisma.systemSettings.findUnique({
                where: { id: 'default' }
            });
            if (!settings || !settings.notifications) {
                console.error('❌ Notification templates not found in settings');
                return false;
            }
            const templates = settings.notifications;
            const template = templates[options.templateType];
            if (!template) {
                console.error(`Template ${options.templateType} not found`);
                return false;
            }
            // Process template with variables
            const emailContent = processTemplate(template, options.variables);
            // Get company info for "from" address
            const general = settings.general;
            const fromEmail = (general === null || general === void 0 ? void 0 : general.email) || 'hello@sparkleville.com';
            const companyName = (general === null || general === void 0 ? void 0 : general.companyName) || 'SparkleVille';
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
// Send welcome email to new user
function sendWelcomeEmail(user, temporaryPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('📧 Preparing to send welcome email to:', user.email);
        const settings = yield prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });
        const general = settings === null || settings === void 0 ? void 0 : settings.general;
        const companyName = (general === null || general === void 0 ? void 0 : general.companyName) || 'SparkleVille';
        const supportEmail = (general === null || general === void 0 ? void 0 : general.email) || 'hello@sparkleville.com';
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
    });
}
