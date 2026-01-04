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
require("dotenv/config");
const prisma_1 = __importDefault(require("./utils/prisma"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Connecting to database...');
            const userCount = yield prisma_1.default.user.count();
            console.log(`Successfully connected! Current user count: ${userCount}`);
            const users = yield prisma_1.default.user.findMany({
                take: 10,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true
                }
            });
            console.log('Sample users:', JSON.stringify(users, null, 2));
        }
        catch (error) {
            console.error('Error connecting to database:', error);
            process.exit(1);
        }
        finally {
            yield prisma_1.default.$disconnect();
        }
    });
}
main();
