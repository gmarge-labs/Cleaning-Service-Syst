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
exports.getBookings = exports.createBooking = void 0;
const client_1 = require("../generated/prisma/client");
const prisma = new client_1.PrismaClient();
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingData = req.body;
        console.log('Received booking data:', JSON.stringify(bookingData, null, 2));
        // Basic validation
        if (!bookingData.serviceType || !bookingData.date || bookingData.totalAmount === undefined) {
            return res.status(400).json({ message: 'Missing required booking fields: serviceType, date, or totalAmount' });
        }
        const booking = yield prisma.booking.create({
            data: {
                userId: bookingData.userId || null,
                guestName: bookingData.guestName || null,
                guestEmail: bookingData.guestEmail || null,
                guestPhone: bookingData.guestPhone || null,
                serviceType: bookingData.serviceType,
                propertyType: bookingData.propertyType,
                bedrooms: bookingData.bedrooms || 0,
                bathrooms: bookingData.bathrooms || 0,
                toilets: bookingData.toilets || 0,
                rooms: bookingData.rooms || {},
                addOns: bookingData.addOns || [],
                date: new Date(bookingData.date),
                time: bookingData.time,
                frequency: bookingData.frequency,
                specialInstructions: bookingData.specialInstructions || '',
                hasPet: bookingData.hasPet || false,
                petDetails: bookingData.petDetails || {},
                paymentMethod: bookingData.paymentMethod || null,
                tipAmount: bookingData.tipAmount || 0,
                totalAmount: bookingData.totalAmount,
                status: bookingData.status || 'PENDING',
            },
        });
        res.status(201).json({
            message: 'Booking created successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Create booking error details:', error);
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.createBooking = createBooking;
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        const bookings = yield prisma.booking.findMany({
            where: userId ? { userId: String(userId) } : {},
            orderBy: { date: 'asc' },
        });
        res.json(bookings);
    }
    catch (error) {
        console.error('Get bookings error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getBookings = getBookings;
