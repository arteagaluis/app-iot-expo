import ProfileScreen from '@/app/(tabs)/profile';
import apiClient from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth-store';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import React from 'react';

jest.mock('@/src/api/client', () => ({
    get: jest.fn(),
}));

jest.mock('@/src/tw/animated', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        Animated: {
            View: ({ children, testID }: any) => React.createElement(View, { testID }, children),
        },
    };
});

describe('ProfileScreen', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock auth store state
        useAuthStore.setState({
            user: { id: '1', name: 'John Doe', email: 'john@example.com', picture: '' },
            logout: jest.fn(),
        });
    });

    it('renders user info correctly', async () => {
        (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: { id: '1', name: 'John Doe' } });
        const { getByText } = render(<ProfileScreen />);

        expect(getByText('John Doe')).toBeTruthy();
        expect(getByText('john@example.com')).toBeTruthy();
        expect(getByText('Personal Info')).toBeTruthy();

        await waitFor(() => {
            expect(apiClient.get).toHaveBeenCalledWith('/auth/me');
        });
    });

    it('handles sign out button press', async () => {
        (apiClient.get as jest.Mock).mockResolvedValueOnce({ data: {} });
        const logoutMock = jest.fn();
        useAuthStore.setState({ logout: logoutMock });

        const { getByText } = render(<ProfileScreen />);

        const signOutButton = getByText('Sign Out');
        fireEvent.press(signOutButton);

        await waitFor(() => {
            expect(logoutMock).toHaveBeenCalled();
        });
    });

    it('handles profile fetch error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });
        (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<ProfileScreen />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching profile:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });
});
