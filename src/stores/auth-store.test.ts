import * as SecureStore from 'expo-secure-store';
import { useAuthStore } from './auth-store';

jest.mock('expo-secure-store');

describe('useAuthStore', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        useAuthStore.setState({
            accessToken: null,
            refreshToken: null,
            userId: null,
            user: null,
            isAuthenticated: false,
            isLoading: true,
        });
    });

    it('should initialize with values from SecureStore', async () => {
        (SecureStore.getItemAsync as jest.Mock)
            .mockResolvedValueOnce('access-token')
            .mockResolvedValueOnce('refresh-token')
            .mockResolvedValueOnce('user-id')
            .mockResolvedValueOnce(JSON.stringify({ id: 'user-id', name: 'Test User' }));

        await useAuthStore.getState().initialize();

        expect(useAuthStore.getState().accessToken).toBe('access-token');
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
        expect(useAuthStore.getState().isLoading).toBe(false);
    });

    it('should set auth state and save to SecureStore', async () => {
        const user = { id: '1', email: 'test@test.com', name: 'Test', picture: '' };
        await useAuthStore.getState().setAuth('at', 'rt', '1', user);

        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'at');
        expect(useAuthStore.getState().accessToken).toBe('at');
        expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('should update access token and save to SecureStore', async () => {
        await useAuthStore.getState().updateAccessToken('new-at', 'new-rt');
        expect(SecureStore.setItemAsync).toHaveBeenCalledWith('accessToken', 'new-at');
        expect(useAuthStore.getState().accessToken).toBe('new-at');
    });

    it('should handle missing values on initialize', async () => {
        (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
        await useAuthStore.getState().initialize();
        expect(useAuthStore.getState().accessToken).toBe(null);
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('should logout and clear SecureStore', async () => {
        useAuthStore.setState({ isAuthenticated: true, accessToken: 'token' });

        await useAuthStore.getState().logout();

        expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('accessToken');
        expect(useAuthStore.getState().isAuthenticated).toBe(false);
        expect(useAuthStore.getState().accessToken).toBe(null);
    });
});
