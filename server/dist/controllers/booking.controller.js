"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeJob = exports.claimJob = exports.updateBooking = exports.getBookings = exports.createBooking = exports.sendInvoice = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const notification_1 = require("../utils/notification");
const email_service_1 = require("../utils/email.service");
const sendInvoice = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, email, total, balanceDue } = req.body;
        const booking = yield prisma_1.default.booking.findUnique({
            where: { id: bookingId }
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        yield (0, email_service_1.sendInvoiceEmail)(booking, email, total, balanceDue);
        res.json({ message: 'Invoice sent successfully' });
    }
    catch (error) {
        console.error('Send invoice error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.sendInvoice = sendInvoice;
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bookingData = req.body;
        // Basic validation
        if (!bookingData.serviceType || !bookingData.date || bookingData.totalAmount === undefined) {
            return res.status(400).json({ message: 'Missing required booking fields: serviceType, date, or totalAmount' });
        }
        let { userId, guestName, guestEmail, guestPhone, address, serviceType, propertyType, bedrooms, bathrooms, toilets, rooms, roomQuantities, addOns, kitchenAddOns, laundryRoomDetails, date, time, frequency, specialInstructions, hasPet, petDetails, paymentMethod, tipAmount, totalAmount, status } = bookingData;
        // If user is logged in, try to populate missing details from user table
        if (userId) {
            const user = yield prisma_1.default.user.findUnique({
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
        // Generate custom booking ID: BK-YYYYMMDD-XXX
        const bookingDate = new Date(date);
        // Use UTC date components to match the ISO date string sent from frontend
        const year = bookingDate.getUTCFullYear();
        const month = String(bookingDate.getUTCMonth() + 1).padStart(2, '0');
        const day = String(bookingDate.getUTCDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        // Count bookings for this specific day to get the sequence number
        const startOfDay = new Date(bookingDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(bookingDate);
        endOfDay.setUTCHours(23, 59, 59, 999);
        const count = yield prisma_1.default.booking.count({
            where: {
                date: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });
        const sequence = String(count + 1).padStart(3, '0');
        const customId = `BK-${dateStr}-${sequence}`;
        // Combine rooms and roomQuantities to ensure all selected rooms are captured
        const combinedRooms = {};
        if (Array.isArray(rooms)) {
            rooms.forEach((room) => {
                combinedRooms[room] = (roomQuantities === null || roomQuantities === void 0 ? void 0 : roomQuantities[room]) || 1;
            });
        }
        else if (roomQuantities) {
            Object.assign(combinedRooms, roomQuantities);
        }
        // Calculate estimated duration and cleaner count
        let estimatedDuration = 0;
        let cleanerCount = 1;
        let paymentPerHour = 20; // Default fallback
        try {
            const settings = yield prisma_1.default.systemSettings.findUnique({ where: { id: 'default' } });
            if (settings) {
                if (settings.durationSettings) {
                    const ds = settings.durationSettings;
                    // Base time
                    let totalMinutes = ds.baseMinutes || 60;
                    // Room times
                    totalMinutes += (bedrooms || 0) * (ds.perBedroom || 30);
                    totalMinutes += (bathrooms || 0) * (ds.perBathroom || 45);
                    totalMinutes += (toilets || 0) * (ds.perToilet || 15);
                    // Other rooms
                    if (rooms && Array.isArray(rooms)) {
                        rooms.forEach((room) => {
                            if (!['Bedroom', 'Bathroom', 'Toilet'].includes(room)) {
                                totalMinutes += ((roomQuantities === null || roomQuantities === void 0 ? void 0 : roomQuantities[room]) || 1) * (ds.perOtherRoom || 20);
                            }
                        });
                    }
                    // Service Multiplier
                    let multiplier = 1.0;
                    if (serviceType === 'Deep Cleaning')
                        multiplier = ds.deepCleaningMultiplier || 1.5;
                    else if (serviceType === 'Move In/Out')
                        multiplier = ds.moveInOutMultiplier || 2.0;
                    else if (serviceType === 'Post-Construction')
                        multiplier = ds.postConstructionMultiplier || 2.5;
                    else
                        multiplier = ds.standardCleaningMultiplier || 1.0;
                    estimatedDuration = Math.round(totalMinutes * multiplier);
                    // Cleaner count: 1 cleaner per 4 hours (240 mins)
                    cleanerCount = Math.ceil(estimatedDuration / 240);
                    if (cleanerCount < 1)
                        cleanerCount = 1;
                }
                // Set default payment per hour from settings
                if (settings.cleanerPay) {
                    const cp = settings.cleanerPay;
                    paymentPerHour = cp.level1 || 20;
                }
            }
        }
        catch (err) {
            console.error('Error calculating duration:', err);
            // Fallback to basic calculation if settings fail
            estimatedDuration = 120 + ((bedrooms || 0) + (bathrooms || 0)) * 30;
            cleanerCount = Math.ceil(estimatedDuration / 240);
        }
        const booking = yield prisma_1.default.booking.create({
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
                rooms: combinedRooms,
                addOns: addOns || [],
                kitchenAddOns: kitchenAddOns ? JSON.parse(JSON.stringify(kitchenAddOns)) : null,
                laundryRoomDetails: laundryRoomDetails ? JSON.parse(JSON.stringify(laundryRoomDetails)) : null,
                date: new Date(date),
                time,
                frequency: frequency || 'One-time',
                specialInstructions: specialInstructions || '',
                hasPet: hasPet || false,
                petDetails: petDetails || {},
                paymentMethod: paymentMethod || null,
                tipAmount: tipAmount || 0,
                totalAmount,
                estimatedDuration,
                cleanerCount,
                paymentPerHour,
                status: status || 'CONFIRMED',
            },
        });
        // Notify admins about the new booking
        yield (0, notification_1.notifyAdmins)({
            type: 'BOOKING_CREATED',
            title: 'New Booking Created',
            message: `A new booking has been created by ${guestName || 'Guest'} for ${serviceType} on ${new Date(date).toLocaleDateString()}`,
            data: {
                bookingId: customId,
                customerId: userId,
                customerName: guestName,
                serviceType,
                bookingDate: date,
                totalAmount: totalAmount.toString()
            }
        });
        // Notify cleaners about the new available job
        yield (0, notification_1.notifyCleaners)({
            type: 'BOOKING_CREATED',
            title: 'New Job Alert! 🔔',
            message: `${guestName || 'A customer'} just posted a new ${serviceType} job in ${address || 'your area'}. Claim it now!`,
            data: {
                bookingId: customId,
                serviceType,
                date,
                totalAmount: totalAmount.toString()
            }
        });
        // Send confirmation email to customer
        if (guestEmail) {
            console.log(`📧 Calling sendBookingConfirmation for ${guestEmail}`);
            const emailResult = yield (0, email_service_1.sendBookingConfirmation)(booking, guestEmail);
            console.log(`📧 sendBookingConfirmation result: ${emailResult}`);
        }
        else {
            console.warn('⚠️ No guestEmail found, skipping confirmation email');
        }
        // Sync with Google Calendar if confirmed
        if (booking.status === 'CONFIRMED' || booking.status === 'BOOKED') {
            try {
                const { createCalendarEvent } = yield Promise.resolve().then(() => __importStar(require('../utils/googleCalendar.utils')));
                yield createCalendarEvent(booking);
            }
            catch (calError) {
                console.error('Google Calendar sync failed:', calError);
            }
        }
        res.status(201).json({
            message: 'Booking created successfully',
            booking,
        });
    }
    catch (error) {
        console.error('Create booking error details:', error);
        console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({
            message: 'Internal server error',
            error: error instanceof Error ? error.message : String(error)
        });
    }
});
exports.createBooking = createBooking;
const getBookings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, cleanerId, status } = req.query;
        console.log('Fetching bookings with query:', { userId, cleanerId, status });
        const bookings = yield prisma_1.default.booking.findMany({
            where: {
                AND: [
                    userId ? { userId: String(userId) } : {},
                    cleanerId ? {
                        OR: [
                            { cleanerId: String(cleanerId) },
                            { claimedBy: { some: { id: String(cleanerId) } } }
                        ]
                    } : {},
                    status ? (typeof status === 'string' && status.includes(',')
                        ? { status: { in: status.split(',') } }
                        : Array.isArray(status)
                            ? { status: { in: status } }
                            : { status: status }) : {},
                ]
            },
            include: {
                user: {
                    select: {
                        name: true,
                        phone: true,
                        email: true
                    }
                },
                cleaner: {
                    select: {
                        name: true,
                        phone: true
                    }
                },
                claimedBy: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true
                    }
                }
            },
            orderBy: { date: 'asc' },
        });
        console.log(`Found ${bookings.length} bookings`);
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
        // Check if this is a reschedule (date is being changed)
        const existingBooking = yield prisma_1.default.booking.findUnique({
            where: { id },
        });
        if (!existingBooking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const booking = yield prisma_1.default.booking.update({
            where: { id },
            data: Object.assign(Object.assign({}, dataWithoutId), { date: updateData.date ? new Date(updateData.date) : undefined }),
        });
        // Sync with Google Calendar if status changed to CONFIRMED
        if (updateData.status === 'CONFIRMED' && existingBooking.status !== 'CONFIRMED') {
            try {
                const { createCalendarEvent } = yield Promise.resolve().then(() => __importStar(require('../utils/googleCalendar.utils')));
                yield createCalendarEvent(booking);
            }
            catch (calError) {
                console.error('Google Calendar sync failed:', calError);
            }
        }
        // Handle Cancellation
        if (updateData.status === 'CANCELLED' && existingBooking.status !== 'CANCELLED') {
            const now = new Date();
            const serviceDateTime = new Date(existingBooking.date);
            // Parse time (e.g., "10:00 AM")
            const timeStr = existingBooking.time;
            const [time, period] = timeStr.split(' ');
            const [hours, minutes] = time.split(':').map(Number);
            let hour24 = hours;
            if (period === 'PM' && hours !== 12)
                hour24 += 12;
            if (period === 'AM' && hours === 12)
                hour24 = 0;
            serviceDateTime.setHours(hour24, minutes, 0, 0);
            const hoursUntilService = (serviceDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
            let refundAmount = 0;
            let penaltyCharge = 0;
            const totalAmount = Number(existingBooking.totalAmount);
            if (hoursUntilService >= 24) {
                refundAmount = totalAmount;
                penaltyCharge = 0;
            }
            else if (hoursUntilService > 0) {
                refundAmount = totalAmount * 0.5;
                penaltyCharge = totalAmount * 0.5;
            }
            else {
                refundAmount = 0;
                penaltyCharge = totalAmount;
            }
            // Notify admins
            yield (0, notification_1.notifyAdmins)({
                type: 'BOOKING_CANCELLED',
                title: 'Booking Cancelled',
                message: `Booking ${id} has been cancelled by customer ${existingBooking.guestName || 'Guest'}. Refund: $${refundAmount.toFixed(2)}, Penalty: $${penaltyCharge.toFixed(2)}`,
                data: {
                    bookingId: id,
                    customerId: existingBooking.userId,
                    customerName: existingBooking.guestName,
                    serviceType: existingBooking.serviceType,
                    refundAmount,
                    penaltyCharge,
                    totalAmount: totalAmount.toString()
                }
            });
            return res.json({
                message: 'Booking cancelled successfully',
                booking,
                refundAmount,
                penaltyCharge
            });
        }
        // If date was changed (reschedule), notify admins
        if (updateData.date && existingBooking.date !== new Date(updateData.date)) {
            const oldDate = existingBooking.date.toLocaleDateString();
            const newDate = new Date(updateData.date).toLocaleDateString();
            yield (0, notification_1.notifyAdmins)({
                type: 'BOOKING_UPDATED',
                title: 'Booking Rescheduled',
                message: `Booking ${id} has been rescheduled from ${oldDate} to ${newDate} by customer ${existingBooking.guestName || 'Guest'}`,
                data: {
                    bookingId: id,
                    customerId: existingBooking.userId,
                    customerName: existingBooking.guestName,
                    serviceType: existingBooking.serviceType,
                    oldDate: oldDate,
                    newDate: newDate,
                    totalAmount: existingBooking.totalAmount.toString()
                }
            });
        }
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
const claimJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { cleanerId } = req.body;
        if (!cleanerId) {
            return res.status(400).json({ message: 'Cleaner ID is required' });
        }
        const booking = yield prisma_1.default.booking.findUnique({
            where: { id },
            include: {
                claimedBy: true
            }
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Check if cleaner already claimed this job
        const alreadyClaimed = booking.claimedBy.some((c) => c.id === cleanerId);
        if (alreadyClaimed) {
            return res.status(400).json({ message: 'You have already claimed this job' });
        }
        // Check if job is already full
        const requiredCleaners = booking.cleanerCount || 1;
        if (booking.claimedBy.length >= requiredCleaners) {
            return res.status(400).json({ message: 'Job is already full' });
        }
        const updatedBooking = yield prisma_1.default.booking.update({
            where: { id },
            data: {
                claimedBy: {
                    connect: { id: cleanerId }
                },
                // For compatibility with single-cleaner views, set cleanerId if it's not already set
                cleanerId: booking.cleanerId || cleanerId,
                // If this was the last required cleaner, mark as CONFIRMED
                status: (booking.claimedBy.length + 1 >= requiredCleaners) ? 'CONFIRMED' : booking.status
            },
            include: {
                user: true,
                claimedBy: true
            }
        });
        // Notify customer
        if ((_a = updatedBooking.user) === null || _a === void 0 ? void 0 : _a.id) {
            const cleaner = updatedBooking.claimedBy.find((c) => c.id === cleanerId);
            yield (0, notification_1.createNotification)({
                userId: updatedBooking.user.id,
                type: 'BOOKING_CONFIRMED',
                title: 'Cleaner Assigned!',
                message: `${(cleaner === null || cleaner === void 0 ? void 0 : cleaner.name) || 'A cleaner'} has been assigned to your cleaning on ${new Date(updatedBooking.date).toLocaleDateString()}.`,
                data: { bookingId: updatedBooking.id }
            });
        }
        res.json({
            message: 'Job claimed successfully',
            booking: updatedBooking
        });
    }
    catch (error) {
        console.error('Claim job error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.claimJob = claimJob;
const completeJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status, notes, issues, photos } = req.body;
        if (status !== 'COMPLETED') {
            return res.status(400).json({ message: 'Invalid status for completion' });
        }
        const booking = yield prisma_1.default.booking.findUnique({
            where: { id },
            include: { user: true }
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        // Process photos - upload to Google Drive if provided
        const photoLinks = [];
        if (photos && Array.isArray(photos)) {
            const { uploadToDrive } = yield Promise.resolve().then(() => __importStar(require('../utils/googleDrive.utils')));
            for (let i = 0; i < photos.length; i++) {
                const photoBase64 = photos[i];
                // Handle base64 string (remove prefix if exists)
                const base64Data = photoBase64.replace(/^data:image\/\w+;base64,/, "");
                const buffer = Buffer.from(base64Data, 'base64');
                // Use a temporary stream or buffer for upload
                const fileName = `job_${id}_photo_${i + 1}.jpg`;
                const uploadResult = yield uploadToDrive(fileName, 'image/jpeg', buffer);
                photoLinks.push(uploadResult.webViewLink);
            }
        }
        const updatedBooking = yield prisma_1.default.booking.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                // Store notes and photo links in a Json field if we add it, or just metadata
                // For now, let's assume we'll use a dynamic field or just update status
            }
        });
        // Notify Admins
        yield (0, notification_1.notifyAdmins)({
            type: 'BOOKING_COMPLETED',
            title: 'Job Completed! ✅',
            message: `Job ${id} has been marked as completed by the cleaner.`,
            data: {
                bookingId: id,
                notes,
                issues,
                photoCount: photoLinks.length,
                photoLinks
            }
        });
        // Notify Customer
        if (booking.userId) {
            yield (0, notification_1.createNotification)({
                userId: booking.userId,
                type: 'BOOKING_COMPLETED',
                title: 'Your cleaning is done! ✨',
                message: `Great news! Your ${booking.serviceType} has been completed. Check your dashboard for details.`,
                data: { bookingId: id }
            });
        }
        // Send completion email
        const { sendBookingCompletion } = yield Promise.resolve().then(() => __importStar(require('../utils/email.service')));
        if (booking.guestEmail) {
            yield sendBookingCompletion(booking, booking.guestEmail);
        }
        res.json({
            message: 'Job completed successfully',
            booking: updatedBooking,
            photoLinks
        });
    }
    catch (error) {
        console.error('Complete job error:', error);
        res.status(500).json({ message: 'Internal server error', error: error instanceof Error ? error.message : String(error) });
    }
});
exports.completeJob = completeJob;
