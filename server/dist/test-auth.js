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
const axios_1 = __importDefault(require("axios"));
const API_URL = 'http://localhost:4000/api/auth';
function testAuth() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            console.log('Testing Signup...');
            const signupRes = yield axios_1.default.post(`${API_URL}/signup`, {
                name: 'Test User',
                email: `test${Date.now()}@example.com`,
                password: 'password123',
                role: 'CUSTOMER'
            });
            console.log('Signup successful:', signupRes.data);
            console.log('\nTesting Login...');
            const loginRes = yield axios_1.default.post(`${API_URL}/login`, {
                email: signupRes.data.user.email,
                password: 'password123'
            });
            console.log('Login successful:', loginRes.data);
            console.log('\nTesting Custom ID Generation (Admin)...');
            const adminRes = yield axios_1.default.post(`${API_URL}/signup`, {
                name: 'Admin User',
                email: `admin${Date.now()}@example.com`,
                password: 'password123',
                role: 'ADMIN'
            });
            console.log('Admin Signup successful:', adminRes.data);
        }
        catch (error) {
            console.error('Test failed:', error.response ? error.response.data : error.message);
        }
    });
}
testAuth();
