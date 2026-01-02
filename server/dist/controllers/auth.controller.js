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
exports.login = exports.signup = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const client_1 = require("@prisma/client");
const idGenerator_1 = require("../utils/idGenerator");
const notification_1 = require("../utils/notification");
const prisma_1 = __importDefault(require("../utils/prisma"));
const signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, role } = req.body;
        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }
        // Check if user exists
        const emailLower = email.toLowerCase();
        const existingUser = yield prisma_1.default.user.findUnique({
            where: { email: emailLower },
        });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }
        // Validate role if provided, default to CUSTOMER
        let userRole = client_1.Role.CUSTOMER;
        if (role && Object.values(client_1.Role).includes(role)) {
            userRole = role;
        }
        // Generate custom ID
        const id = yield (0, idGenerator_1.generateUserId)(userRole);
        // Hash password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create user
        const user = yield prisma_1.default.user.create({
            data: {
                id,
                name,
                email: emailLower,
                password: hashedPassword,
                role: userRole,
            },
        });
        // Return user without password
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        // Notify admins about new user registration
        yield (0, notification_1.notifyAdmins)({
            type: 'USER_REGISTERED',
            title: 'New User Registered',
            message: `A new user ${name} (${userRole}) has registered.`,
            data: { userId: id, role: userRole }
        });
        // Send welcome email
        try {
            console.log(`📧 Calling sendWelcomeEmail for ${user.email}`);
            const { sendWelcomeEmail } = yield Promise.resolve().then(() => __importStar(require('../utils/email.service')));
            const emailResult = yield sendWelcomeEmail(user);
            console.log(`📧 sendWelcomeEmail result: ${emailResult}`);
        }
        catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }
        res.status(201).json({
            message: 'User created successfully',
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.signup = signup;
//function for login
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }
        // Find user
        const emailLower = email.toLowerCase();
        console.log(`Attempting login for: ${emailLower}`);
        const user = yield prisma_1.default.user.findUnique({
            where: { email: emailLower },
        });
        if (!user) {
            console.log(`User not found: ${emailLower}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Check password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        console.log(`Password valid for ${emailLower}: ${isPasswordValid}`);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Return user without password
        const { password: _ } = user, userWithoutPassword = __rest(user, ["password"]);
        res.json({
            message: 'Login successful',
            user: userWithoutPassword,
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.login = login;
