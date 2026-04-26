import Dashboard from '@/app/(tabs)/index';
import { useAuthStore } from '@/src/stores/auth-store';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('Dashboard', () => {
    it('renders welcome message with user name', () => {
        useAuthStore.setState({ user: { id: '1', name: 'Luis', email: '', picture: '' } });

        const { getByText } = render(<Dashboard />);
        expect(getByText('Welcome back,')).toBeTruthy();
        expect(getByText('Luis')).toBeTruthy();
    });

    it('renders device list', () => {
        const { getByText } = render(<Dashboard />);
        expect(getByText('Living Room Light')).toBeTruthy();
        expect(getByText('Air Conditioner')).toBeTruthy();
    });
});
