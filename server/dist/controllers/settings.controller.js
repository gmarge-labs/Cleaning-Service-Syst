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
exports.updateSettings = exports.getSettings = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const DEFAULT_SETTINGS = {
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
        weeklyDiscount: 10,
        biWeeklyDiscount: 5,
        monthlyDiscount: 15,
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
        'Carpet Cleaning': 50,
        'Pet Hair Removal': 25,
        'Organization': 45,
        'Dish Washing': 20,
    },
    integrations: {
        stripe: { enabled: true, apiKey: 'sk_test_***************' },
        plivo: { enabled: true, apiKey: 'MA***************' },
        sendgrid: { enabled: true, apiKey: 'SG.***************' },
        quickbooks: { enabled: false, apiKey: '' },
        googleCalendar: { enabled: true, apiKey: 'AIza***************' },
    },
    notifications: {
        confirmation: 'Dear {customer_name}, Your booking for {service_type} on {date} at {time} has been confirmed...',
        reminder: 'Hi {customer_name}, This is a reminder that your {service_type} is scheduled for tomorrow at {time}...',
        completion: 'Hi {customer_name}, Your cleaning service has been completed. We hope you\'re satisfied with the results...',
        welcome: 'Dear {customer_name}, Welcome to our platform! Your account has been created and you can now access all our services.',
    }
};
const getSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let settings = yield prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });
        if (!settings) {
            settings = yield prisma.systemSettings.create({
                data: Object.assign({ id: 'default' }, DEFAULT_SETTINGS)
            });
        }
        res.json(settings);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSettings = getSettings;
const updateSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const updates = req.body;
        // Use update instead of upsert to handle partial updates correctly.
        // Prisma update will ignore undefined fields, but upsert's create block requires all fields.
        const settings = yield prisma.systemSettings.update({
            where: { id: 'default' },
            data: updates
        });
        res.json(settings);
    }
    catch (error) {
        if (error.code === 'P2025') {
            // Record not found, create it with defaults merged with updates
            try {
                const settings = yield prisma.systemSettings.create({
                    data: Object.assign(Object.assign({ id: 'default' }, DEFAULT_SETTINGS), req.body)
                });
                return res.json(settings);
            }
            catch (createError) {
                console.error('Create settings error:', createError);
                return res.status(500).json({ message: 'Failed to create settings' });
            }
        }
        console.error('Update settings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateSettings = updateSettings;
