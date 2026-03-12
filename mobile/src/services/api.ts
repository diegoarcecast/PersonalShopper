import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

export const api = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    timeout: 15000,
});

// Request interceptor: attach JWT
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('auth_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor: log errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token on 401
            SecureStore.deleteItemAsync('auth_token');
        }
        return Promise.reject(error);
    }
);

