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
exports.markAllByTypeAsRead = exports.getUnreadCountsByType = exports.createNotification = exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getUnreadCount = exports.getUserNotifications = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// Get all notifications for a user
const getUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { page = 1, limit = 10, isRead } = req.query;
    try {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const skip = (pageNum - 1) * limitNum;
        // Build where clause
        const where = { userId };
        if (isRead !== undefined) {
            where.isRead = isRead === 'true';
        }
        // Get total count
        const totalCount = yield prisma_1.default.notification.count({ where });
        // Fetch notifications
        const notifications = yield prisma_1.default.notification.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limitNum,
        });
        const totalPages = Math.ceil(totalCount / limitNum);
        res.json({
            data: notifications,
            pagination: {
                page: pageNum,
                limit: limitNum,
                totalCount,
                totalPages,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            },
        });
    }
    catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUserNotifications = getUserNotifications;
// Get unread notification count
const getUnreadCount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const unreadCount = yield prisma_1.default.notification.count({
            where: {
                userId,
                isRead: false,
            },
        });
        res.json({ unreadCount });
    }
    catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUnreadCount = getUnreadCount;
// Mark notification as read
const markAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.params;
    try {
        const notification = yield prisma_1.default.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });
        res.json(notification);
    }
    catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.markAsRead = markAsRead;
// Mark all notifications as read
const markAllAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        yield prisma_1.default.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });
        res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all as read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.markAllAsRead = markAllAsRead;
// Delete notification
const deleteNotification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.params;
    try {
        yield prisma_1.default.notification.delete({
            where: { id: notificationId },
        });
        res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteNotification = deleteNotification;
// Create notification (internal use)
const createNotification = (userId, type, title, message, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield prisma_1.default.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data,
            },
        });
        return notification;
    }
    catch (error) {
        console.error('Create notification error:', error);
    }
});
exports.createNotification = createNotification;
// Get unread notification counts by type
const getUnreadCountsByType = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const bookingCount = yield prisma_1.default.notification.count({
            where: {
                userId,
                isRead: false,
                type: 'BOOKING_CREATED'
            },
        });
        const reviewCount = yield prisma_1.default.notification.count({
            where: {
                userId,
                isRead: false,
                type: 'REVIEW_RECEIVED'
            },
        });
        const messageCount = yield prisma_1.default.notification.count({
            where: {
                userId,
                isRead: false,
                type: 'MESSAGE_RECEIVED'
            },
        });
        res.json({
            bookings: bookingCount,
            reviews: reviewCount,
            messaging: messageCount,
        });
    }
    catch (error) {
        console.error('Get unread counts by type error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getUnreadCountsByType = getUnreadCountsByType;
// Mark all notifications of a specific type as read
const markAllByTypeAsRead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { type } = req.query;
    if (!type || typeof type !== 'string') {
        return res.status(400).json({ error: 'Type parameter is required' });
    }
    try {
        yield prisma_1.default.notification.updateMany({
            where: { userId, isRead: false, type },
            data: { isRead: true },
        });
        res.json({ message: `All ${type} notifications marked as read` });
    }
    catch (error) {
        console.error('Mark all by type as read error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.markAllByTypeAsRead = markAllByTypeAsRead;
