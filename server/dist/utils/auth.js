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
exports.authenticate = void 0;
const prisma_1 = __importDefault(require("./prisma"));
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // For now, we'll expect the userId in the 'x-user-id' header
        // In a real app, this would be a JWT token
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const user = yield prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true }
        });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = {
            id: user.id,
            role: user.role
        };
        next();
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ message: 'Invalid authentication' });
    }
});
exports.authenticate = authenticate;
