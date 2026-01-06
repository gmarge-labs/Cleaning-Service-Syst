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
exports.updateReviewStatus = exports.getPublishedReviews = exports.getReviews = exports.createReview = void 0;
const notification_1 = require("../utils/notification");
const email_service_1 = require("../utils/email.service");
const prisma_1 = __importDefault(require("../utils/prisma"));
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId, rating, comment, userId } = req.body;
        console.log('Creating review for booking:', bookingId);
        if (!bookingId || !rating) {
            return res.status(400).json({ message: 'Booking ID and rating are required' });
        }
        // Relaxed check: If booking exists, we can do some validation, 
        // but we allow the review even if it's a dummy ID
        const booking = yield prisma_1.default.booking.findUnique({
            where: { id: bookingId }
        });
        if (booking) {
            // If it's a real booking, we can still check ownership if userId is provided
            if (booking.userId && userId && booking.userId !== userId) {
                console.warn(`User ${userId} attempted to review booking ${bookingId} owned by ${booking.userId}`);
                // For now, we'll just log a warning and allow it as requested by the user
            }
        }
        const review = yield prisma_1.default.review.create({
            data: {
                bookingId: booking ? bookingId : null,
                rating,
                comment: comment || '',
            }
        });
        // Update booking as accepted when review is submitted
        if (booking) {
            yield prisma_1.default.booking.update({
                where: { id: bookingId },
                data: { isAccepted: true }
            });
            console.log(`Booking ${bookingId} marked as accepted after review submission`);
        }
        // Notify admins about the new review
        yield (0, notification_1.notifyAdmins)({
            type: 'REVIEW_RECEIVED',
            title: 'New Review Received',
            message: `A new ${rating}-star review has been submitted for booking ${bookingId}.`,
            data: { bookingId, rating, reviewId: review.id }
        });
        res.status(201).json(review);
    }
    catch (error) {
        console.error('Create review error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.createReview = createReview;
const getReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching all reviews');
        const reviews = yield prisma_1.default.review.findMany({
            include: {
                booking: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Found ${reviews.length} reviews`);
        res.json(reviews);
    }
    catch (error) {
        console.error('Get reviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getReviews = getReviews;
const getPublishedReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Fetching published reviews');
        const reviews = yield prisma_1.default.review.findMany({
            where: {
                status: 'PUBLISHED'
            },
            include: {
                booking: {
                    include: {
                        user: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Found ${reviews.length} published reviews`);
        res.json(reviews);
    }
    catch (error) {
        console.error('Get published reviews error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getPublishedReviews = getPublishedReviews;
const updateReviewStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { id } = req.params;
        const { status, adminReply } = req.body;
        console.log(`Updating review ${id} status to ${status}`);
        const review = yield prisma_1.default.review.update({
            where: { id },
            data: {
                status,
                adminReply,
                repliedAt: adminReply ? new Date() : undefined
            },
            include: {
                booking: {
                    include: {
                        user: true
                    }
                }
            }
        });
        // If there's an admin reply, send an email to the customer
        if (adminReply && review.booking) {
            const customerEmail = ((_a = review.booking.user) === null || _a === void 0 ? void 0 : _a.email) || review.booking.guestEmail;
            const customerName = ((_b = review.booking.user) === null || _b === void 0 ? void 0 : _b.name) || review.booking.guestName || 'Valued Customer';
            if (customerEmail) {
                try {
                    yield (0, email_service_1.sendEmail)({
                        to: customerEmail,
                        subject: 'Response to your Sparkleville review',
                        templateType: 'broadcast',
                        variables: {
                            name: customerName,
                            message: `Hello ${customerName},\n\nThank you for your review! Our team has responded to your feedback:\n\n"${adminReply}"\n\nBest regards,\nThe Sparkleville Team`
                        }
                    });
                    console.log(`Reply email sent to ${customerEmail}`);
                }
                catch (emailError) {
                    console.error('Error sending review reply email:', emailError);
                }
            }
        }
        res.json(review);
    }
    catch (error) {
        console.error('Update review status error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateReviewStatus = updateReviewStatus;
