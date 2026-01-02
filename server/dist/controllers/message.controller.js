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
exports.getAvailableContacts = exports.sendMessage = exports.getMessages = exports.getConversations = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        console.log(`API: Getting conversations for user ${userId}`);
        // Get all users that the current user has exchanged messages with
        const messages = yield prisma_1.default.message.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            orderBy: {
                createdAt: 'desc'
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        name: true,
                        role: true,
                    }
                }
            }
        });
        console.log(`API: Found ${messages.length} messages for user ${userId}`);
        // Group by conversation partner
        const conversationsMap = new Map();
        messages.forEach(msg => {
            const partner = msg.senderId === userId ? msg.receiver : msg.sender;
            if (!conversationsMap.has(partner.id)) {
                conversationsMap.set(partner.id, {
                    id: partner.id,
                    name: partner.name,
                    role: partner.role,
                    lastMessage: msg.text,
                    time: msg.createdAt,
                    unread: msg.receiverId === userId && !msg.isRead ? 1 : 0,
                    online: false, // You can implement online status later
                });
            }
            else if (msg.receiverId === userId && !msg.isRead) {
                const conv = conversationsMap.get(partner.id);
                conv.unread += 1;
            }
        });
        res.json(Array.from(conversationsMap.values()));
    }
    catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getConversations = getConversations;
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { partnerId } = req.params;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const messages = yield prisma_1.default.message.findMany({
            where: {
                OR: [
                    { senderId: userId, receiverId: partnerId },
                    { senderId: partnerId, receiverId: userId }
                ]
            },
            orderBy: {
                createdAt: 'asc'
            }
        });
        // Mark messages as read
        yield prisma_1.default.message.updateMany({
            where: {
                senderId: partnerId,
                receiverId: userId,
                isRead: false
            },
            data: {
                isRead: true
            }
        });
        res.json(messages);
    }
    catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getMessages = getMessages;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const senderId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const { receiverId, text } = req.body;
        if (!senderId)
            return res.status(401).json({ message: 'Unauthorized' });
        const message = yield prisma_1.default.message.create({
            data: {
                senderId,
                receiverId,
                text
            }
        });
        res.status(201).json(message);
    }
    catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.sendMessage = sendMessage;
const getAvailableContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        let contacts;
        if (userRole === 'CLEANER') {
            // Cleaners can message Admins, Support, and Supervisors
            contacts = yield prisma_1.default.user.findMany({
                where: {
                    role: {
                        in: ['ADMIN', 'SUPPORT', 'SUPERVISOR']
                    }
                },
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            });
        }
        else {
            // Admins, Support, Supervisors can message everyone (Cleaners, Customers, and each other)
            contacts = yield prisma_1.default.user.findMany({
                where: {
                    id: { not: userId }
                },
                select: {
                    id: true,
                    name: true,
                    role: true
                }
            });
        }
        res.json(contacts);
    }
    catch (error) {
        console.error('Get contacts error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getAvailableContacts = getAvailableContacts;
