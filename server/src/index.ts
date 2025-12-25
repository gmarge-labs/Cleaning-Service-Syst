import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './utils/socket';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

initSocket(httpServer);

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';
import inventoryRoutes from './routes/inventory.routes';
import reviewRoutes from './routes/review.routes';

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

httpServer.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
