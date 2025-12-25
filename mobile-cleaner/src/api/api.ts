import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the local IP of the machine running the server
// For Windows, find it with 'ipconfig' (e.g., 192.168.0.x)
// For Mac/Linux, find it with 'ifconfig'
const BASE_URL = 'http://192.168.0.155:5000/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
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
            // You can add custom headers here if the server expects them
            // config.headers['X-User-Id'] = user.id;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
