"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const socket_1 = require("./utils/socket");
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const port = process.env.PORT || 5000;
(0, socket_1.initSocket)(httpServer);
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const booking_routes_1 = __importDefault(require("./routes/booking.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const settings_routes_1 = __importDefault(require("./routes/settings.routes"));
const dashboard_routes_1 = __importDefault(require("./routes/dashboard.routes"));
const inventory_routes_1 = __importDefault(require("./routes/inventory.routes"));
const review_routes_1 = __importDefault(require("./routes/review.routes"));
const cleaner_routes_1 = __importDefault(require("./routes/cleaner.routes"));
const message_routes_1 = __importDefault(require("./routes/message.routes"));
const support_routes_1 = __importDefault(require("./routes/support.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/bookings', booking_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/settings', settings_routes_1.default);
app.use('/api/dashboard', dashboard_routes_1.default);
app.use('/api/inventory', inventory_routes_1.default);
app.use('/api/reviews', review_routes_1.default);
app.use('/api/cleaners', cleaner_routes_1.default);
app.use('/api/messages', message_routes_1.default);
app.use('/api/support', support_routes_1.default);
app.get('/', (req, res) => {
    res.send('Welcome to Sparkleville API. Visit <a href="/api/health">/api/health</a> for server status.');
});
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});
httpServer.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
