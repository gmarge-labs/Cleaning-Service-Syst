import api from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    phone?: string;
    address?: string;
    createdAt?: string;
}

export const authService = {
    login: async (email: string, password: string): Promise<User> => {
        try {
            const response = await api.post('/auth/login', { email, password });
            const { user } = response.data;

            if (user.role !== 'CLEANER') {
                throw new Error('This app is only for cleaners.');
            }

            await AsyncStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error: any) {
            const message = error.response?.data?.message || error.message || 'Login failed';
            throw new Error(message);
        }
    },

    logout: async () => {
        await AsyncStorage.removeItem('user');
    },

    getCurrentUser: async (): Promise<User | null> => {
        const userJson = await AsyncStorage.getItem('user');
        return userJson ? JSON.parse(userJson) : null;
    }
};
