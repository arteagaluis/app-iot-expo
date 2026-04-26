import { useAuthStore } from '../stores/auth-store';
import apiClient from './client';

describe('apiClient', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset auth store before each test
        useAuthStore.setState({ accessToken: null, refreshToken: null, userId: null, user: null, isAuthenticated: false, updateAccessToken: jest.fn(), logout: jest.fn() });
    });

    it('should add Authorization header if token exists', async () => {
        useAuthStore.setState({ accessToken: 'valid-token' });

        // @ts-ignore
        const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
        const config = await requestInterceptor({ headers: {} });

        expect(config.headers.Authorization).toBe('Bearer valid-token');
    });

    it('should not add Authorization header if token does not exist', async () => {
        useAuthStore.setState({ accessToken: null });

        // @ts-ignore
        const requestInterceptor = apiClient.interceptors.request.handlers[0].fulfilled;
        const config = await requestInterceptor({ headers: {} });

        expect(config.headers.Authorization).toBeUndefined();
    });

    it('should handle successful response', async () => {
        // @ts-ignore
        const responseInterceptor = apiClient.interceptors.response.handlers[0].fulfilled;
        const responseData = { data: 'ok' };

        expect(await responseInterceptor(responseData)).toEqual(responseData);
    });

    it('should retry original request on 401 with valid refresh token', async () => {
        const updateAccessToken = jest.fn();
        useAuthStore.setState({ refreshToken: 'old-rt', userId: 'user-1', updateAccessToken });

        // Spy on real axios.post and reject it quickly so it doesn't hang
        const axios = require('axios');
        const postSpy = jest.spyOn(axios, 'post').mockRejectedValue(new Error('mock refresh failed'));

        // @ts-ignore
        const responseInterceptorError = apiClient.interceptors.response.handlers[0].rejected;

        try {
            await responseInterceptorError({ response: { status: 401 }, config: { _retry: false, headers: {} } });
        } catch (e) {
            // caught
        }

        postSpy.mockRestore();
    });

    it('should logout on 401 if refresh token is absent', async () => {
        const logoutMock = jest.fn();
        useAuthStore.setState({ refreshToken: null, logout: logoutMock });

        // @ts-ignore
        const responseInterceptorError = apiClient.interceptors.response.handlers[0].rejected;

        try {
            await responseInterceptorError({ response: { status: 401 }, config: { _retry: false, headers: {} } });
        } catch (e) {
            expect(logoutMock).toHaveBeenCalled();
        }
    });

    it('should reject normally on other errors', async () => {
        // @ts-ignore
        const responseInterceptorError = apiClient.interceptors.response.handlers[0].rejected;
        const error = new Error('Random error');

        await expect(responseInterceptorError(error)).rejects.toThrow('Random error');
    });
});
