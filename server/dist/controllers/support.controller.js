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
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitContactForm = void 0;
const client_1 = require("@prisma/client");
const email_service_1 = require("../utils/email.service");
const prisma = new client_1.PrismaClient();
const submitContactForm = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, phone, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ message: 'Name, email, and message are required' });
        }
        // 1. Save to database (optional, but good for records)
        // Check if we have a ContactMessage model, if not, we'll just send the email
        try {
            if (prisma.contactMessage) {
                yield prisma.contactMessage.create({
                    data: { name, email, phone, message }
                });
            }
        }
        catch (dbError) {
            console.warn('Could not save contact message to DB:', dbError);
        }
        // 2. Send email to company
        const settings = yield prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });
        const general = settings === null || settings === void 0 ? void 0 : settings.general;
        const companyEmail = (general === null || general === void 0 ? void 0 : general.email) || 'hello@Sparkleville.com';
        yield (0, email_service_1.sendEmail)({
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
    }
    catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.submitContactForm = submitContactForm;
