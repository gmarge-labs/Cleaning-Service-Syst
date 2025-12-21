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
exports.notifyUser = exports.notifyAdmins = exports.createNotification = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const createNotification = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, type, title, message, data = {} }) {
    try {
        return yield prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data,
                isRead: false
            }
        });
    }
    catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
});
exports.createNotification = createNotification;
const notifyAdmins = (params) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admins = yield prisma.user.findMany({
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
const notifyUser = (params) => __awaiter(void 0, void 0, void 0, function* () {
    return (0, exports.createNotification)(params);
});
exports.notifyUser = notifyUser;
