import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { toast } from 'sonner';

const SOCKET_URL = 'http://localhost:4000'; // Match your server port

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (user?.id) {
      // Initialize socket connection
      socketRef.current = io(SOCKET_URL);

      // Join user-specific room and role room
      socketRef.current.emit('join', { 
        userId: user.id, 
        role: user.role?.toLowerCase() 
      });

      // Listen for notifications
      socketRef.current.on('new_notification', (notification) => {
        toast.info(notification.title, {
          description: notification.message,
        });
      });

      // Listen for messages
      socketRef.current.on('receive_message', (data) => {
        toast.info(`New message from ${data.senderId}`, {
          description: data.text,
        });
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user?.id]);

  const sendMessage = (receiverId: string, text: string) => {
    if (socketRef.current && user?.id) {
      socketRef.current.emit('send_message', {
        senderId: user.id,
        receiverId,
        text,
        timestamp: new Date().toISOString(),
      });
    }
  };

  const broadcastMessage = (target: 'all' | 'cleaners' | 'customers' | 'staff', text: string, subject?: string) => {
    if (socketRef.current && user?.id) {
      socketRef.current.emit('broadcast_message', {
        senderId: user.id,
        target,
        text,
        subject: subject || 'Important Announcement from SparkleVille',
        timestamp: new Date().toISOString(),
      });
    }
  };

  return {
    socket: socketRef.current,
    sendMessage,
    broadcastMessage,
  };
};
