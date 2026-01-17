import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { initSocket } from './utils/socket';
import { initializeAPIConfigs } from './utils/api-initialization.service';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const port = process.env.PORT || 5000;

initSocket(httpServer);

// CORS configuration
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost') || origin.startsWith('http://192.168.')) {
      callback(null, true);
    } else {
      console.log(`[CORS] Rejected origin: ${origin}`);
      fs.appendFileSync(path.join(process.cwd(), 'cors_debug.log'), `[${new Date().toISOString()}] Rejected origin: ${origin}\n`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));


app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import authRoutes from './routes/auth.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import notificationRoutes from './routes/notification.routes';
import settingsRoutes from './routes/settings.routes';
import dashboardRoutes from './routes/dashboard.routes';
import inventoryRoutes from './routes/inventory.routes';
import reviewRoutes from './routes/review.routes';
import cleanerRoutes from './routes/cleaner.routes';
import messageRoutes from './routes/message.routes';
import supportRoutes from './routes/support.routes';

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cleaners', cleanerRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/support', supportRoutes);

app.get('/', (req, res) => {
  res.send('Welcome to Sparkleville API. Visit <a href="/api/health">/api/health</a> for server status.');
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// httpServer.listen(port, async () => {

//   console.log(`Server is running on port ${port}`);
  
//   // Initialize API configurations on startup
//   await initializeAPIConfigs();
// });

// Attach error handler FIRST, before any listen attempts
httpServer.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`Port ${port} is in use, retrying in 5 seconds...`);
    setTimeout(() => {
      httpServer.close();
      httpServer.listen(port, async () => {
        console.log(`Server is running on port ${port}`);
        await initializeAPIConfigs();
      });
    }, 5000);
  } else {
    throw err;
  }
});

// Now listen
httpServer.listen(port, async () => {
  console.log(`Server is running on port ${port}`);
  
  // Initialize API configurations on startup
  await initializeAPIConfigs();
});