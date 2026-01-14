import { io, Socket } from 'socket.io-client';
import ENV from '../config/environment';

class SocketService {
    private socket: Socket | null = null;

    connect(userId: string, role: string) {
        if (this.socket?.connected) return;

        this.socket = io(ENV.socketUrl, {
            transports: ['websocket'],
            query: { userId, role }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();