import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;
const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const socketService = {
    connect: (userId: string, role: string = 'admin') => {
        if (socket?.connected) return socket;

        socket = io(SOCKET_URL, {
            transports: ['websocket'],
            forceNew: true,
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        socket.on('connect', () => {
            console.log('Admin connected to socket server');
            socket?.emit('join', { userId, role });
        });

        socket.on('disconnect', () => {
            console.log('Admin disconnected from socket server');
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
        });

        return socket;
    },

    disconnect: () => {
        if (socket) {
            socket.disconnect();
            socket = null;
        }
    },

    getSocket: () => socket,

    // Send message to a cleaner
    sendMessage: (cleanerId: string, message: string, adminId: string, adminName: string) => {
        if (!socket?.connected) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('admin-to-cleaner-message', {
            cleanerId,
            adminId,
            adminName,
            message,
            timestamp: new Date().toISOString()
        });
    },

    // Listen for messages from cleaners
    onCleanerMessage: (callback: (data: any) => void) => {
        if (!socket) return;
        socket.on('cleaner-to-admin-message', callback);
    },

    // Get cleaner's active job
    getCleanerActiveJob: (cleanerId: string) => {
        if (!socket?.connected) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('get-cleaner-active-job', { cleanerId });
    },

    // Listen for cleaner's active job
    onCleanerActiveJob: (callback: (data: any) => void) => {
        if (!socket) return;
        socket.on('cleaner-active-job', callback);
    },

    // Get cleaner's claimed jobs
    getCleanerClaimedJobs: (cleanerId: string) => {
        if (!socket?.connected) {
            console.error('Socket not connected');
            return;
        }
        socket.emit('get-cleaner-claimed-jobs', { cleanerId });
    },

    // Listen for cleaner's claimed jobs
    onCleanerClaimedJobs: (callback: (data: any) => void) => {
        if (!socket) return;
        socket.on('cleaner-claimed-jobs', callback);
    }
};
