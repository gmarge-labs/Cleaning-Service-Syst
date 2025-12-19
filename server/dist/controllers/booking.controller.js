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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateBooking = exports.getBookings = exports.createBooking = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingData = req.body;
        console.log('Received booking data:', JSON.stringify(bookingData, null, 2));
        // Basic validation
        if (!bookingData.serviceType || !bookingData.date || bookingData.totalAmount === undefined) {
            return res.status(400).json({ message: 'Missing required booking fields: serviceType, date, or totalAmount' });
        }
        let { userId, guestName, guestEmail, guestPhone, address, serviceType, propertyType, bedrooms, bathrooms, toilets, rooms, addOns, date, time, frequency, specialInstructions, hasPet, petDetails, paymentMethod, tipAmount, totalAmount, status } = bookingData;
        // If user is logged in, try to populate missing details from user table
        if (userId) {
            const user = yield prisma.user.findUnique({
                where: { id: userId }
            });
            if (user) {
                // Use user details if not provided in booking data, or as per user request:
                // "if any of these are not in the users table, it should show null for the one not available, otherwise it should take them"
                guestName = guestName || user.name || null;
                guestEmail = guestEmail || user.email || null;
                guestPhone = guestPhone || user.phone || null;
                address = address || user.address || null;
            }
        }
        // Generate custom booking ID: BK-YYYYMMDD-XXXX
        const bookingDate = new Date(date);
        const dateStr = bookingDate.toISOString().split('T')[0].replace(/-/g, '');
        const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
        const customId = `BK-${dateStr}-${randomStr}`;
        const booking = yield prisma.booking.create({
            data: {
                id: customId,
                userId: userId || null,
                guestName: guestName || null,
                guestEmail: guestEmail || null,
                guestPhone: guestPhone || null,
                address: address || null,
                serviceType,
                propertyType,
                bedrooms: bedrooms || 0,
                bathrooms: bathrooms || 0,
                toilets: toilets || 0,
                rooms: rooms || {},
                addOns: addOns || [],
                date: new Date(date),
                time,
                frequency: frequency || 'One-time',
                specialInstructions: specialInstructions || '',
                hasPet: hasPet || false,
                petDetails: petDetails || {},
                paymentMethod: paymentMethod || null,
                tipAmount: tipAmount || 0,
                totalAmount,
                status: status || 'BOOKED',
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
const updateBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const { id: _ } = updateData, dataWithoutId = __rest(updateData, ["id"]);
        const booking = yield prisma.booking.update({
            where: { id },
            data: Object.assign(Object.assign({}, dataWithoutId), { 
                // Ensure date is handled correctly if provided
                date: updateData.date ? new Date(updateData.date) : undefined }),
        });
        res.json({
            message: 'Booking updated successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
    }
});
exports.updateBooking = updateBooking;
