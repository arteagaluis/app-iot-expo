import { create } from 'zustand';
import { storage } from '../api/storage';

interface User {
    id: string;
    email: string;
    name: string;
    picture: string;
}

interface AuthState {
    accessToken: string | null;
    refreshToken: string | null;
    userId: string | null;
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    setAuth: (accessToken: string, refreshToken: string, userId: string, user: User) => Promise<void>;
    updateAccessToken: (accessToken: string, refreshToken: string) => Promise<void>;
    logout: () => Promise<void>;
    initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    accessToken: null,
    refreshToken: null,
    userId: null,
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setAuth: async (accessToken, refreshToken, userId, user) => {
        try {
            await storage.setItem('accessToken', accessToken);
            await storage.setItem('refreshToken', refreshToken);
            await storage.setItem('userId', userId);
            await storage.setItem('user', JSON.stringify(user));

            set({
                accessToken,
                refreshToken,
                userId,
                user,
                isAuthenticated: true
            });
        } catch (error) {
            console.error('Error saving auth state:', error);
        }
    },

    updateAccessToken: async (accessToken, refreshToken) => {
        try {
            await storage.setItem('accessToken', accessToken);
            await storage.setItem('refreshToken', refreshToken);
            set({ accessToken, refreshToken });
        } catch (error) {
            console.error('Error updating access token:', error);
        }
    },

    logout: async () => {
        try {
            await storage.deleteItem('accessToken');
            await storage.deleteItem('refreshToken');
            await storage.deleteItem('userId');
            await storage.deleteItem('user');

            set({
                accessToken: null,
                refreshToken: null,
                userId: null,
                user: null,
                isAuthenticated: false
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    },

    initialize: async () => {
        try {
            const accessToken = await storage.getItem('accessToken');
            const refreshToken = await storage.getItem('refreshToken');
            const userId = await storage.getItem('userId');
            const userJson = await storage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;

            if (accessToken && refreshToken && userId) {
                set({
                    accessToken,
                    refreshToken,
                    userId,
                    user,
                    isAuthenticated: true,
                    isLoading: false
                });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            console.error('Error initializing auth state:', error);
            set({ isLoading: false });
        }
    }
}));
