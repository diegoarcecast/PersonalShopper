import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';

interface AuthState {
    token: string | null;
    email: string | null;
    isLoading: boolean;
    setAuth: (token: string, email: string) => Promise<void>;
    logout: () => Promise<void>;
    loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: null,
    email: null,
    isLoading: true,

    setAuth: async (token, email) => {
        await SecureStore.setItemAsync('auth_token', token);
        await SecureStore.setItemAsync('auth_email', email);
        set({ token, email });
    },

    logout: async () => {
        await SecureStore.deleteItemAsync('auth_token');
        await SecureStore.deleteItemAsync('auth_email');
        set({ token: null, email: null });
    },

    loadToken: async () => {
        const token = await SecureStore.getItemAsync('auth_token');
        const email = await SecureStore.getItemAsync('auth_email');
        set({ token, email, isLoading: false });
    },
}));
