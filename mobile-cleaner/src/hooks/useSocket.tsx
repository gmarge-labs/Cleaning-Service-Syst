import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { socketService } from '../api/socket.service';
import { Socket } from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(socketService.getSocket());
    const [isConnected, setIsConnected] = useState(socket?.connected || false);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const loadUser = async () => {
            const userJson = await AsyncStorage.getItem('user');
            if (userJson) {
                setUser(JSON.parse(userJson));
            }
        };
        loadUser();
    }, []);

    useEffect(() => {
        if (user && !socket) {
            const newSocket = socketService.connect(user.id, user.role);
            setSocket(newSocket);
        }

        if (socket) {
            const onConnect = () => setIsConnected(true);
            const onDisconnect = () => setIsConnected(false);

            socket.on('connect', onConnect);
            socket.on('disconnect', onDisconnect);

            setIsConnected(socket.connected);

            return () => {
                socket.off('connect', onConnect);
                socket.off('disconnect', onDisconnect);
            };
        }
    }, [user, socket]);

    return { socket, isConnected };
};
