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
exports.generateUserId = generateUserId;
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const PREFIXES = {
    [client_1.Role.CUSTOMER]: 'user',
    [client_1.Role.ADMIN]: 'adm',
    [client_1.Role.SUPERVISOR]: 'sup',
    [client_1.Role.SUPPORT]: 'spt',
    [client_1.Role.CLEANER]: 'spkl',
};
function generateUserId(role) {
    return __awaiter(this, void 0, void 0, function* () {
        const prefix = PREFIXES[role];
        // Generate a unique ID using UUID v4 with the role prefix
        // This eliminates race conditions entirely
        const uniquePart = (0, uuid_1.v4)().replace(/-/g, '').substring(0, 12);
        return `${prefix}_${uniquePart}`;
    });
}
