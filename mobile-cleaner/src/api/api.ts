import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use the local IP of the machine running the server
// For Windows, find it with 'ipconfig' (e.g., 192.168.0.x)
// Note: In development on the same machine, 'localhost' is often more reliable for web.
const SERVER_IP = '192.168.0.155';
export const BASE_URL = Platform.OS === 'web'
    ? 'http://localhost:5000/api'
    : `http://${SERVER_IP}:5000/api`;

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 15000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to add auth token/user ID if needed in the future
// Note: Currently the server doesn't use JWT, but we can store the logged-in user info
api.interceptors.request.use(
    async (config) => {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            // Add X-User-Id header for development authentication
            config.headers['x-user-id'] = user.id;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
