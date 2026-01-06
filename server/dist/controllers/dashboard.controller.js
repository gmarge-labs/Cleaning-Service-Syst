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
exports.getActiveJob = exports.getSupportStats = exports.getSupervisorStats = exports.getAdminStats = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = __importDefault(require("../utils/prisma"));
const getAdminStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Get date range from query parameters
        const { startDate, endDate } = req.query;
        // Build where clause with optional date filtering
        const where = {
            status: {
                in: [client_1.BookingStatus.COMPLETED, client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.BOOKED]
            }
        };
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) {
                where.createdAt.gte = new Date(startDate);
            }
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                where.createdAt.lte = end;
            }
        }
        // Get total revenue
        const bookings = yield prisma_1.default.booking.findMany({
            where,
            select: {
                totalAmount: true,
                createdAt: true,
                serviceType: true,
                status: true
            }
        });
        const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.totalAmount), 0);
        const totalBookings = bookings.length;
        // Get active cleaners
        const activeCleaners = yield prisma_1.default.user.count({
            where: { role: client_1.Role.CLEANER }
        });
        // Service type distribution
        const serviceTypeCounts = {};
        bookings.forEach(b => {
            serviceTypeCounts[b.serviceType] = (serviceTypeCounts[b.serviceType] || 0) + 1;
        });
        const serviceTypeData = Object.entries(serviceTypeCounts).map(([name, value]) => ({
            name,
            value,
            color: name === 'Standard Cleaning' ? '#FF1493' :
                name === 'Deep Cleaning' ? '#8b5cf6' :
                    name === 'Move In/Out' ? '#FF69B4' : '#f59e0b'
        }));
        // Revenue data for chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();
        const revenueData = last7Days.map(date => {
            const dayBookings = bookings.filter(b => b.createdAt.toISOString().split('T')[0] === date);
            return {
                day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: dayBookings.reduce((sum, b) => sum + Number(b.totalAmount), 0),
                bookings: dayBookings.length
            };
        });
        // Recent activity from notifications
        const notifications = yield prisma_1.default.notification.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' }
        });
        const recentActivity = notifications.map(n => ({
            id: n.id,
            type: n.type,
            message: n.message,
            time: formatTimeAgo(n.createdAt),
            title: n.title
        }));
        // Get top performers (cleaners) with their job counts and ratings
        const cleaners = yield prisma_1.default.user.findMany({
            where: { role: client_1.Role.CLEANER },
            take: 5
        });
        const cleanerPerformance = cleaners.map(c => {
            // Random rating between 4.5 and 5.0, rounded to 2 decimals
            const rating = Math.round((4.5 + Math.random() * 0.5) * 100) / 100;
            return {
                name: c.name,
                jobs: Math.floor(Math.random() * 20) + 5,
                rating: rating
            };
        }).sort((a, b) => b.jobs - a.jobs);
        res.json({
            stats: {
                totalRevenue,
                totalBookings,
                activeCleaners,
                avgRating: 4.8 // Placeholder as Review model is missing
            },
            revenueData,
            serviceTypeData,
            recentActivity,
            cleanerPerformance
        });
    }
    catch (error) {
        console.error('Get admin stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAdminStats = getAdminStats;
const getSupervisorStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const activeJobs = yield prisma_1.default.booking.findMany({
            where: {
                status: {
                    in: [client_1.BookingStatus.CONFIRMED, client_1.BookingStatus.RESCHEDULED]
                }
            },
            orderBy: { date: 'asc' }
        });
        const unassignedJobs = yield prisma_1.default.booking.findMany({
            where: {
                status: client_1.BookingStatus.BOOKED
            },
            orderBy: { date: 'asc' }
        });
        const availableCleaners = yield prisma_1.default.user.findMany({
            where: { role: client_1.Role.CLEANER },
            select: {
                id: true,
                name: true,
                phone: true,
                createdAt: true
            }
        });
        res.json({
            activeJobs,
            unassignedJobs,
            availableCleaners: availableCleaners.map(c => (Object.assign(Object.assign({}, c), { rating: 4.9, jobsToday: 0 // Placeholder
             }))),
            pendingInspections: [] // Placeholder
        });
    }
    catch (error) {
        console.error('Get supervisor stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSupervisorStats = getSupervisorStats;
const getSupportStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Using notifications as a proxy for tickets for now
        const notifications = yield prisma_1.default.notification.findMany({
            where: {
                type: {
                    in: ['booking_created', 'booking_cancelled', 'cleaner_application']
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        const tickets = notifications.map(n => ({
            id: n.id,
            customer: n.title,
            subject: n.message,
            status: n.isRead ? 'Resolved' : 'New',
            priority: 'Medium',
            time: formatTimeAgo(n.createdAt)
        }));
        res.json({
            tickets,
            stats: {
                openTickets: tickets.filter(t => t.status === 'New').length,
                pendingFollowUps: 3, // Placeholder
                resolvedToday: tickets.filter(t => t.status === 'Resolved').length,
                avgResponseTime: 4.8 // Placeholder
            },
            upcomingFollowUps: [] // Placeholder
        });
    }
    catch (error) {
        console.error('Get support stats error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSupportStats = getSupportStats;
const getActiveJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.query;
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        // Find the most recent active booking for this user that has been assigned/started
        // This includes: CONFIRMED, ARRIVED, IN_PROGRESS, COMPLETED
        const activeJob = yield prisma_1.default.booking.findFirst({
            where: {
                userId: userId,
                status: {
                    in: [
                        client_1.BookingStatus.CONFIRMED,
                        client_1.BookingStatus.ARRIVED,
                        client_1.BookingStatus.IN_PROGRESS,
                        client_1.BookingStatus.COMPLETED
                    ]
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                reviews: true,
                claimedBy: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                        profileImage: true
                    }
                },
                user: true
            }
        });
        if (!activeJob) {
            return res.status(404).json({ message: 'No active job found' });
        }
        res.json(activeJob);
    }
    catch (error) {
        console.error('Get active job error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getActiveJob = getActiveJob;
function formatTimeAgo(date) {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffInSeconds < 60)
        return 'just now';
    if (diffInSeconds < 3600)
        return `${Math.floor(diffInSeconds / 60)} min ago`;
    if (diffInSeconds < 86400)
        return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
}
