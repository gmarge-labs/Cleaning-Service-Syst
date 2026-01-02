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
exports.emitToAdmins = exports.emitToUser = exports.getIO = exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const email_service_1 = require("./email.service");
const prisma_1 = __importDefault(require("./prisma"));
let io;
const initSocket = (server) => {
    io = new socket_io_1.Server(server, {
        cors: {
            origin: '*', // In production, specify the frontend URL
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
        // Join a room based on userId for targeted notifications
        socket.on('join', (data) => {
            const userId = typeof data === 'string' ? data : data.userId;
            const role = typeof data === 'string' ? null : data.role;
            socket.join(userId);
            if (role) {
                socket.join(role);
                console.log(`User ${userId} joined room and role room: ${role}`);
            }
            else {
                console.log(`User ${userId} joined room`);
            }
        });
        // Handle chat messages
        socket.on('send_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`Socket: Message from ${data.senderId} to ${data.receiverId}: ${data.text}`);
            try {
                // Persist message to database
                const message = yield prisma_1.default.message.create({
                    data: {
                        senderId: data.senderId,
                        receiverId: data.receiverId,
                        text: data.text
                    }
                });
                console.log(`Socket: Message saved to DB with ID ${message.id}`);
                // Emit to the receiver's room
                io.to(data.receiverId).emit('receive_message', Object.assign(Object.assign({}, data), { id: message.id, createdAt: message.createdAt }));
                console.log(`Socket: Emitted receive_message to room ${data.receiverId}`);
                // Also emit back to sender for confirmation
                socket.emit('message_sent', Object.assign(Object.assign({}, data), { id: message.id, createdAt: message.createdAt }));
                console.log(`Socket: Emitted message_sent back to sender ${data.senderId}`);
            }
            catch (error) {
                console.error('Socket send_message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        }));
        // Handle broadcast messages
        socket.on('broadcast_message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            // Send via WebSockets for real-time UI updates
            if (data.target === 'all') {
                io.emit('broadcast_received', data);
            }
            else {
                io.to(data.target).emit('broadcast_received', data);
            }
            // Also send via Email for customers (or everyone if target is 'all')
            if (data.target === 'customers' || data.target === 'all') {
                yield (0, email_service_1.sendBroadcastEmail)(data.target, data.subject || 'Important Announcement from Sparkleville', data.text);
            }
        }));
        // Handle admin-to-cleaner messages
        socket.on('admin-to-cleaner-message', (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`[Socket] Message from admin ${data.adminId} to cleaner ${data.cleanerId}: ${data.message}`);
            try {
                // Persist message to database
                const message = yield prisma_1.default.message.create({
                    data: {
                        senderId: data.adminId,
                        receiverId: data.cleanerId,
                        text: data.message
                    }
                });
                console.log(`[Socket] Message saved to DB with ID ${message.id}`);
                // Emit to the cleaner's room
                io.to(data.cleanerId).emit('cleaner-to-admin-message', Object.assign(Object.assign({}, data), { id: message.id, createdAt: message.createdAt }));
                console.log(`[Socket] Emitted message to cleaner room ${data.cleanerId}`);
                // Also emit back to admin for confirmation
                socket.emit('message_sent', Object.assign(Object.assign({}, data), { id: message.id, createdAt: message.createdAt }));
                console.log(`[Socket] Emitted message_sent confirmation to admin ${data.adminId}`);
            }
            catch (error) {
                console.error('[Socket] admin-to-cleaner-message error:', error);
                socket.emit('error', { message: 'Failed to send message' });
            }
        }));
        // Handle cleaner active job request
        socket.on('get-cleaner-active-job', (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`[Socket] Admin requesting active job for cleaner ${data.cleanerId}`);
            try {
                // Get the cleaner's active job (status IN_PROGRESS)
                const activeJob = yield prisma_1.default.booking.findFirst({
                    where: {
                        status: 'IN_PROGRESS',
                        claimedBy: {
                            some: {
                                id: data.cleanerId
                            }
                        }
                    },
                    select: {
                        id: true,
                        serviceType: true,
                        address: true,
                        status: true,
                        startTime: true,
                        estimatedDuration: true
                    }
                });
                // Emit to the admin's room
                io.to(socket.id).emit('cleaner-active-job', {
                    cleanerId: data.cleanerId,
                    job: activeJob || null
                });
                console.log(`[Socket] Sent active job for cleaner ${data.cleanerId}`);
            }
            catch (error) {
                console.error('[Socket] get-cleaner-active-job error:', error);
                socket.emit('error', { message: 'Failed to fetch active job' });
            }
        }));
        // Handle cleaner claimed jobs request
        socket.on('get-cleaner-claimed-jobs', (data) => __awaiter(void 0, void 0, void 0, function* () {
            console.log(`[Socket] Admin requesting claimed jobs for cleaner ${data.cleanerId}`);
            try {
                // Get all claimed jobs for the cleaner that are not completed
                const claimedJobs = yield prisma_1.default.booking.findMany({
                    where: {
                        claimedBy: {
                            some: {
                                id: data.cleanerId
                            }
                        },
                        status: {
                            notIn: ['COMPLETED', 'CANCELLED']
                        }
                    },
                    select: {
                        id: true,
                        serviceType: true,
                        address: true,
                        status: true,
                        date: true,
                        time: true,
                        estimatedDuration: true,
                        guestName: true
                    },
                    orderBy: {
                        date: 'asc'
                    }
                });
                // Emit to the admin's room
                io.to(socket.id).emit('cleaner-claimed-jobs', {
                    cleanerId: data.cleanerId,
                    jobs: claimedJobs || []
                });
                console.log(`[Socket] Sent ${claimedJobs.length} claimed jobs for cleaner ${data.cleanerId}`);
            }
            catch (error) {
                console.error('[Socket] get-cleaner-claimed-jobs error:', error);
                socket.emit('error', { message: 'Failed to fetch claimed jobs' });
            }
        }));
        socket.on('disconnect', () => {
            console.log('User disconnected:', socket.id);
        });
    });
    return io;
};
exports.initSocket = initSocket;
const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};
exports.getIO = getIO;
const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId).emit(event, data);
    }
};
exports.emitToUser = emitToUser;
const emitToAdmins = (event, data) => {
    if (io) {
        // Assuming admins are in an 'admins' room
        io.to('admins').emit(event, data);
    }
};
exports.emitToAdmins = emitToAdmins;
