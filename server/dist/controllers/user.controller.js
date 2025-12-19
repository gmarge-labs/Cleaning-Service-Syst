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
exports.createUser = exports.getAllUsers = exports.deletePaymentMethod = exports.addPaymentMethod = exports.deleteAddress = exports.addAddress = exports.changePassword = exports.updateProfile = exports.getProfile = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: {
                    orderBy: { createdAt: 'desc' },
                },
                paymentMethods: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Don't send password
        const { password } = user, profile = __rest(user, ["password"]);
        res.json(profile);
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { name, phone, notificationSettings } = req.body;
    try {
        const updatedUser = yield prisma.user.update({
            where: { id: userId },
            data: {
                name,
                phone,
                notificationSettings,
            },
        });
        const { password } = updatedUser, profile = __rest(updatedUser, ["password"]);
        res.json(profile);
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.updateProfile = updateProfile;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    try {
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const isMatch = yield bcrypt_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid current password' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
        yield prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        res.json({ message: 'Password updated successfully' });
    }
    catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.changePassword = changePassword;
// Address Management
const addAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { label, street, city, state, zip, isDefault } = req.body;
    try {
        if (isDefault) {
            yield prisma.address.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        const address = yield prisma.address.create({
            data: {
                userId,
                label,
                street,
                city,
                state,
                zip,
                isDefault,
            },
        });
        res.status(201).json(address);
    }
    catch (error) {
        console.error('Add address error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.addAddress = addAddress;
const deleteAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { addressId } = req.params;
    try {
        yield prisma.address.delete({
            where: { id: addressId },
        });
        res.json({ message: 'Address deleted successfully' });
    }
    catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deleteAddress = deleteAddress;
// Payment Method Management
const addPaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { type, last4, expiry, isDefault } = req.body;
    try {
        if (isDefault) {
            yield prisma.paymentMethod.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        const paymentMethod = yield prisma.paymentMethod.create({
            data: {
                userId,
                type,
                last4,
                expiry,
                isDefault,
            },
        });
        res.status(201).json(paymentMethod);
    }
    catch (error) {
        console.error('Add payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.addPaymentMethod = addPaymentMethod;
const deletePaymentMethod = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { paymentMethodId } = req.params;
    try {
        yield prisma.paymentMethod.delete({
            where: { id: paymentMethodId },
        });
        res.json({ message: 'Payment method deleted successfully' });
    }
    catch (error) {
        console.error('Delete payment method error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.deletePaymentMethod = deletePaymentMethod;
// Admin User Management
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
                updatedAt: true,
            }
        });
        res.json(users);
    }
    catch (error) {
        console.error('Get all users error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.getAllUsers = getAllUsers;
const createUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    try {
        const existingUser = yield prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Import generateUserId utility or use a simple one if not available
        // For now, let's use a simple cuid-like or just let Prisma handle it if we change schema
        // But schema has id as String @id without default.
        // Let's check auth.controller.ts for how it's done there.
        const { generateUserId } = require('../utils/idGenerator');
        const id = yield generateUserId(role);
        const user = yield prisma.user.create({
            data: {
                id,
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                role,
            },
        });
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.status(201).json(userWithoutPassword);
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.createUser = createUser;
