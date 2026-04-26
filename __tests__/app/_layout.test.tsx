import RootLayout from '@/app/_layout';
import { useAuthStore } from '@/src/stores/auth-store';
import { render, waitFor } from '@testing-library/react-native';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';

jest.mock('expo-router', () => {
    const React = require('react');
    const { Text } = require('react-native');
    const Stack = Object.assign(
        ({ children }: any) => <>{children}</>,
        { Screen: ({ name }: any) => <Text>{name}</Text> }
    );
    return {
        Stack,
        useRouter: jest.fn(),
        useSegments: jest.fn(),
    };
});

jest.mock('expo-status-bar', () => ({
    StatusBar: () => null,
}));

jest.mock('@tanstack/react-query', () => ({
    QueryClient: jest.fn(() => ({})),
    QueryClientProvider: ({ children }: any) => <>{children}</>,
}));

describe('RootLayout', () => {
    let mockRouterReplace: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockRouterReplace = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ replace: mockRouterReplace });
        (useSegments as jest.Mock).mockReturnValue(['']);

        useAuthStore.setState({
            isAuthenticated: false,
            isLoading: false,
            initialize: jest.fn(),
        });
    });

    it('renders correctly', () => {
        const { getByText } = render(<RootLayout />);
        expect(getByText('(auth)/login')).toBeTruthy();
        expect(getByText('(tabs)')).toBeTruthy();
    });

    it('redirects to /(auth)/login if not authenticated and not in auth group', async () => {
        useAuthStore.setState({ isAuthenticated: false, isLoading: false, initialize: jest.fn() });
        (useSegments as jest.Mock).mockReturnValue(['(tabs)']); // not auth group

        render(<RootLayout />);

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith('/(auth)/login');
        });
    });

    it('redirects to /(tabs) if authenticated and in auth group', async () => {
        useAuthStore.setState({ isAuthenticated: true, isLoading: false, initialize: jest.fn() });
        (useSegments as jest.Mock).mockReturnValue(['(auth)']); // in auth group

        render(<RootLayout />);

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith('/(tabs)');
        });
    });

    it('waits if loading', async () => {
        useAuthStore.setState({ isAuthenticated: false, isLoading: true, initialize: jest.fn() });
        (useSegments as jest.Mock).mockReturnValue(['(tabs)']);

        render(<RootLayout />);

        expect(mockRouterReplace).not.toHaveBeenCalled();
    });
});
