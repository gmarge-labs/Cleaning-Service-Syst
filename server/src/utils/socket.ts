import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { sendBroadcastEmail } from './email.service';

let io: Server;

export const initSocket = (server: HttpServer) => {
  io = new Server(server, {
    cors: {
      origin: '*', // In production, specify the frontend URL
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    // Join a room based on userId for targeted notifications
    socket.on('join', (data: string | { userId: string, role?: string }) => {
      const userId = typeof data === 'string' ? data : data.userId;
      const role = typeof data === 'string' ? null : data.role;
      
      socket.join(userId);
      if (role) {
        socket.join(role);
        console.log(`User ${userId} joined room and role room: ${role}`);
      } else {
        console.log(`User ${userId} joined room`);
      }
    });

    // Handle chat messages
    socket.on('send_message', (data: { 
      senderId: string, 
      receiverId: string, 
      text: string,
      timestamp: string 
    }) => {
      // Emit to the receiver's room
      io.to(data.receiverId).emit('receive_message', data);
      // Also emit back to sender for confirmation (or handle locally)
      socket.emit('message_sent', data);
    });

    // Handle broadcast messages
    socket.on('broadcast_message', async (data: {
      senderId: string,
      target: 'all' | 'cleaners' | 'customers' | 'staff',
      text: string,
      subject?: string,
      timestamp: string
    }) => {
      // Send via WebSockets for real-time UI updates
      if (data.target === 'all') {
        io.emit('broadcast_received', data);
      } else {
        io.to(data.target).emit('broadcast_received', data);
      }

      // Also send via Email for customers (or everyone if target is 'all')
      if (data.target === 'customers' || data.target === 'all') {
        await sendBroadcastEmail(
          data.target, 
          data.subject || 'Important Announcement from Sparkleville', 
          data.text
        );
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const emitToUser = (userId: string, event: string, data: any) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

export const emitToAdmins = (event: string, data: any) => {
  if (io) {
    // Assuming admins are in an 'admins' room
    io.to('admins').emit(event, data);
  }
};
