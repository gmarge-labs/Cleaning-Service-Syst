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
exports.notifyUser = exports.notifyCleaners = exports.notifyAdmins = exports.createNotification = void 0;
const socket_1 = require("./socket");
const expo_server_sdk_1 = require("expo-server-sdk");
const prisma_1 = __importDefault(require("./prisma"));
const expo = new expo_server_sdk_1.Expo();
const createNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, type, title, message, data = {} }) {
    try {
        const notification = yield prisma_1.default.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data,
                isRead: false
            }
        });
        // Emit real-time notification via socket
        (0, socket_1.emitToUser)(userId, 'new_notification', notification);
        // Send Push Notification
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { pushToken: true }
        });
        if ((user === null || user === void 0 ? void 0 : user.pushToken) && expo_server_sdk_1.Expo.isExpoPushToken(user.pushToken)) {
            try {
                yield expo.sendPushNotificationsAsync([{
                        to: user.pushToken,
                        sound: 'default',
                        title,
                        body: message,
                        data,
                    }]);
            }
            catch (pushError) {
                console.error('Error sending push notification:', pushError);
            }
        }
        return notification;
    }
    catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
});
exports.createNotification = createNotification;
const notifyAdmins = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma_1.default.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPERVISOR']
                }
            },
            select: { id: true }
        });
        const notifications = yield Promise.all(admins.map(admin => (0, exports.createNotification)(Object.assign(Object.assign({}, params), { userId: admin.id }))));
        return notifications;
    }
    catch (error) {
        console.error('Error notifying admins:', error);
        return [];
    }
});
exports.notifyAdmins = notifyAdmins;
const notifyCleaners = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cleaners = yield prisma_1.default.user.findMany({
            where: {
                role: 'CLEANER'
            },
            select: { id: true }
        });
        const notifications = yield Promise.all(cleaners.map(cleaner => (0, exports.createNotification)(Object.assign(Object.assign({}, params), { userId: cleaner.id }))));
        return notifications;
    }
    catch (error) {
        console.error('Error notifying cleaners:', error);
        return [];
    }
});
exports.notifyCleaners = notifyCleaners;
const notifyUser = (params) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.createNotification)(params);
});
exports.notifyUser = notifyUser;
