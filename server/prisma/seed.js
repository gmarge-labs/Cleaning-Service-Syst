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
const client_1 = require("../src/generated/prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const password = yield bcrypt_1.default.hash('password123', 10);
        const users = [
            {
                id: 'seed_admin',
                email: 'admin@admin.com',
                name: 'Admin User',
                role: client_1.Role.ADMIN,
                password,
            },
            {
                id: 'seed_supervisor',
                email: 'supervisor@supervisor.com',
                name: 'Supervisor User',
                role: client_1.Role.SUPERVISOR,
                password,
            },
            {
                id: 'seed_support',
                email: 'support@support.com',
                name: 'Support User',
                role: client_1.Role.SUPPORT,
                password,
            },
            {
                id: 'seed_cleaner',
                email: 'cleaner@sparkleville.com',
                name: 'Cleaner User',
                role: client_1.Role.CLEANER,
                password,
            },
            {
                id: 'seed_customer',
                email: 'customer@example.com',
                name: 'Customer User',
                role: client_1.Role.CUSTOMER,
                password,
            },
        ];
        console.log('Start seeding ...');
        for (const user of users) {
            const existingUser = yield prisma.user.findUnique({
                where: { email: user.email },
            });
            if (!existingUser) {
                const createdUser = yield prisma.user.create({
                    data: user,
                });
                console.log(`Created user with id: ${createdUser.id}`);
            }
            else {
                console.log(`User with email ${user.email} already exists`);
            }
        }
        console.log('Seeding finished.');
    });
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma.$disconnect();
}));
