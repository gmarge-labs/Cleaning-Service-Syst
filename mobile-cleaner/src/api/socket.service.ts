import { io, Socket } from 'socket.io-client';
import { BASE_URL } from './api';

let socket: Socket | null = null;

export const socketService = {
    connect: (userId: string, role?: string) => {
        if (socket) return socket;

        // Use the same base URL as the API, but without the /api suffix
        const socketUrl = BASE_URL.replace('/api', '');

        socket = io(socketUrl, {
            transports: ['websocket'],
            forceNew: true
        });

        socket.on('connect', () => {
            console.log('Connected to socket server');
            socket?.emit('join', { userId, role });
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from socket server');
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

    getSocket: () => socket
};
