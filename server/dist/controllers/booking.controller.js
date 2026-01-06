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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyArrival = exports.claimJob = exports.updateBooking = exports.getBookings = exports.createBooking = exports.sendInvoice = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const notification_1 = require("../utils/notification");
const email_service_1 = require("../utils/email.service");
const booking_1 = require("../utils/booking");
const socket_1 = require("../utils/socket");
// import { uploadBase64Image } from '../utils/googleDrive'; // TODO: Google Drive uploads disabled
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
        // Parse the date string to avoid timezone issues
        let year, month, day;
        if (typeof date === 'string') {
            // If it's a string like "2025-01-22", extract the components
            const [dateYear, dateMonth, dateDay] = date.split('T')[0].split('-').map(Number);
            year = dateYear;
            month = dateMonth;
            day = dateDay;
        }
        else {
            // If it's a Date object, extract local date components
            const d = new Date(date);
            year = d.getFullYear();
            month = d.getMonth() + 1;
            day = d.getDate();
        }
        const monthStr = String(month).padStart(2, '0');
        const dayStr = String(day).padStart(2, '0');
        const dateStr = `${year}${monthStr}${dayStr}`;
        // Create date boundaries using UTC to ensure consistent behavior across timezones
        const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
        const endOfDay = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999));
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
        const { estimatedDuration, cleanerCount } = yield (0, booking_1.calculateBookingDuration)({
            bedrooms, bathrooms, toilets, rooms, roomQuantities, kitchenAddOns, laundryRoomDetails, addOns, serviceType
        });
        let paymentPerHour = 20; // Default fallback
        try {
            const settings = yield prisma_1.default.systemSettings.findUnique({ where: { id: 'default' } });
            if (settings && settings.cleanerPay) {
                const cp = settings.cleanerPay;
                paymentPerHour = cp.level1 || 20;
            }
        }
        catch (err) {
            console.error('Error fetching cleaner pay settings:', err);
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
                date: new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0)),
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
                status: status || 'PENDING',
                securityCode: Math.floor(1000 + Math.random() * 9000).toString(),
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
            message: `A new ${serviceType} job is available in ${address || 'your area'}. Claim it now!`,
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
                },
                reviews: true
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
        // Recalculate duration and cleaner count if relevant fields are updated
        let { estimatedDuration, cleanerCount } = existingBooking;
        const relevantFields = ['bedrooms', 'bathrooms', 'toilets', 'rooms', 'roomQuantities', 'kitchenAddOns', 'laundryRoomDetails', 'addOns', 'serviceType'];
        const isRelevantUpdate = relevantFields.some(field => field in updateData);
        if (isRelevantUpdate) {
            const mergedData = Object.assign(Object.assign({}, existingBooking), updateData);
            const result = yield (0, booking_1.calculateBookingDuration)(mergedData);
            estimatedDuration = result.estimatedDuration;
            cleanerCount = result.cleanerCount;
        }
        // TODO: Google Drive uploads disabled for now - storing photos directly in database
        // Handle Google Drive Uploads for Completion Photos
        // let drivePhotoLinks = updateData.completionPhotos;
        // if (updateData.completionPhotos && Array.isArray(updateData.completionPhotos)) {
        //   const now = new Date();
        //   const year = now.getFullYear().toString();
        //   const month = (now.getMonth() + 1).toString().padStart(2, '0');
        //   const day = now.getDate().toString().padStart(2, '0');
        //   
        //   const folderPath = [year, month, day, `Booking_${id}`, 'Completion'];
        //   
        //   const uploadPromises = updateData.completionPhotos.map(async (base64: string, index: number) => {
        //     // Only upload if it's a base64 string (starts with data:image)
        //     if (base64.startsWith('data:image')) {
        //       const timestamp = new Date().getTime();
        //       return await uploadBase64Image(base64, `Completion_${timestamp}_${index + 1}.jpg`, folderPath);
        //     }
        //     return base64; // Already a link
        //   });
        //   
        //   drivePhotoLinks = await Promise.all(uploadPromises);
        // }
        // Handle Google Drive Uploads for Revision Photos
        // let revisionPhotoLinks = updateData.revisionPhotos;
        // if (updateData.revisionPhotos && Array.isArray(updateData.revisionPhotos)) {
        //   const now = new Date();
        //   const year = now.getFullYear().toString();
        //   const month = (now.getMonth() + 1).toString().padStart(2, '0');
        //   const day = now.getDate().toString().padStart(2, '0');
        //   
        //   const folderPath = [year, month, day, `Booking_${id}`, 'Revision'];
        //   
        //   const uploadPromises = updateData.revisionPhotos.map(async (base64: string, index: number) => {
        //     if (base64.startsWith('data:image')) {
        //       const timestamp = new Date().getTime();
        //       return await uploadBase64Image(base64, `Revision_${timestamp}_${index + 1}.jpg`, folderPath);
        //     }
        //     return base64;
        //   });
        //   
        //   revisionPhotoLinks = await Promise.all(uploadPromises);
        // }
        // Store photos directly in database (base64 format)
        const completionPhotos = updateData.completionPhotos;
        const revisionPhotos = updateData.revisionPhotos;
        const booking = yield prisma_1.default.booking.update({
            where: { id },
            data: Object.assign(Object.assign({}, dataWithoutId), { completionPhotos: completionPhotos, revisionPhotos: revisionPhotos, date: updateData.date ? (() => {
                    // Parse date string to avoid timezone issues - store as UTC midnight
                    let year, month, day;
                    if (typeof updateData.date === 'string') {
                        const [dateYear, dateMonth, dateDay] = updateData.date.split('T')[0].split('-').map(Number);
                        year = dateYear;
                        month = dateMonth;
                        day = dateDay;
                    }
                    else {
                        const d = new Date(updateData.date);
                        year = d.getFullYear();
                        month = d.getMonth() + 1;
                        day = d.getDate();
                    }
                    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
                })() : undefined, estimatedDuration,
                cleanerCount, startTime: updateData.status === 'IN_PROGRESS' ? new Date() : undefined, endTime: updateData.status === 'COMPLETED' ? new Date() : undefined }),
            include: {
                claimedBy: true
            }
        });
        // Notify cleaner if job is started or revision requested
        if (updateData.status === 'IN_PROGRESS') {
            booking.claimedBy.forEach((cleaner) => {
                (0, socket_1.emitToUser)(cleaner.id, 'job_started', { bookingId: id });
            });
        }
        if (updateData.status === 'REVISION_REQUESTED') {
            booking.claimedBy.forEach((cleaner) => {
                (0, notification_1.createNotification)({
                    userId: cleaner.id,
                    type: 'REVISION_REQUESTED',
                    title: 'Revision Requested',
                    message: `A revision has been requested for job ${id}. Please check the details.`,
                    data: { bookingId: id }
                });
                (0, socket_1.emitToUser)(cleaner.id, 'revision_requested', { bookingId: id });
            });
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
        if (updateData.date) {
            // Parse new date using UTC to ensure consistent comparison
            let newYear, newMonth, newDay;
            if (typeof updateData.date === 'string') {
                const [y, m, d] = updateData.date.split('T')[0].split('-').map(Number);
                newYear = y;
                newMonth = m;
                newDay = d;
            }
            else {
                const d = new Date(updateData.date);
                newYear = d.getFullYear();
                newMonth = d.getMonth() + 1;
                newDay = d.getDate();
            }
            // Compare just the date portions (ignoring time)
            const oldYear = existingBooking.date.getUTCFullYear();
            const oldMonth = existingBooking.date.getUTCMonth() + 1;
            const oldDay = existingBooking.date.getUTCDate();
            if (newYear !== oldYear || newMonth !== oldMonth || newDay !== oldDay) {
                const oldDate = existingBooking.date.toLocaleDateString();
                const newDate = new Date(newYear, newMonth - 1, newDay).toLocaleDateString();
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
        // Generate security code if not already set
        const securityCode = booking.securityCode || Math.floor(1000 + Math.random() * 9000).toString();
        const updatedBooking = yield prisma_1.default.booking.update({
            where: { id },
            data: {
                claimedBy: {
                    connect: { id: cleanerId }
                },
                securityCode,
                // For compatibility with single-cleaner views, set cleanerId if it's not already set
                cleanerId: booking.cleanerId || cleanerId,
                // If this was the last required cleaner, mark as CONFIRMED
                status: (booking.claimedBy.length + 1 >= requiredCleaners) ? 'CONFIRMED' : 'PENDING'
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
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.claimJob = claimJob;
const notifyArrival = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const { id } = req.params;
        const { cleanerId, securityCode } = req.body;
        const booking = yield prisma_1.default.booking.findUnique({
            where: { id },
            include: {
                user: true,
                claimedBy: {
                    where: { id: cleanerId }
                }
            }
        });
        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }
        const cleaner = booking.claimedBy[0];
        if (!cleaner) {
            return res.status(404).json({ message: 'Cleaner not found or not assigned to this job' });
        }
        // Update booking status to ARRIVED and store the code provided by the cleaner
        yield prisma_1.default.booking.update({
            where: { id },
            data: {
                status: 'ARRIVED',
                cleanerProvidedCode: securityCode || null
            }
        });
        // Send notification to customer
        if ((_a = booking.user) === null || _a === void 0 ? void 0 : _a.id) {
            yield (0, notification_1.createNotification)({
                userId: booking.user.id,
                type: 'CLEANER_ARRIVED',
                title: 'Cleaner Arrived!',
                message: `${cleaner.name} has arrived at your location. Please verify their credentials in your dashboard.`,
                data: {
                    bookingId: booking.id,
                    cleanerName: cleaner.name,
                    cleanerId: cleaner.id,
                    cleanerImage: cleaner.profileImage,
                    providedCode: securityCode
                }
            });
        }
        // Also send email if guestEmail exists
        const customerEmail = booking.guestEmail || ((_b = booking.user) === null || _b === void 0 ? void 0 : _b.email);
        if (customerEmail) {
            yield (0, email_service_1.sendEmail)({
                to: customerEmail,
                subject: 'Your Cleaner has Arrived!',
                templateType: 'broadcast',
                variables: {
                    name: booking.guestName || ((_c = booking.user) === null || _c === void 0 ? void 0 : _c.name) || 'Customer',
                    message: `
            Your cleaner, ${cleaner.name}, has arrived for your booking ${booking.id}.
            
            For your security, please verify their credentials:
            Name: ${cleaner.name}
            ID: ${cleaner.id}
            
            The cleaner will ask for a verification code if required.
          `
                }
            });
        }
        res.json({ message: 'Arrival notification sent successfully' });
    }
    catch (error) {
        console.error('Notify arrival error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.notifyArrival = notifyArrival;
