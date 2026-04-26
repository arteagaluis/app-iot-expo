import TabLayout from '@/app/(tabs)/_layout';
import { render } from '@testing-library/react-native';
import React from 'react';

jest.mock('expo-router', () => {
    const React = require('react');
    const { Text } = require('react-native');
    const Tabs = Object.assign(({ children }: any) => <>{children}</>, {
        Screen: ({ name }: any) => <Text>{name}</Text>,
    });
    return { Tabs };
});

jest.mock('expo-blur', () => ({
    BlurView: () => null,
}));

jest.mock('@/src/components/haptic-tab', () => ({
    HapticTab: () => null,
}));

jest.mock('@/src/components/ui/icon-symbol', () => ({
    IconSymbol: () => null,
}));

describe('TabLayout', () => {
    it('renders tabs correctly', () => {
        const { getByText } = render(<TabLayout />);

        expect(getByText('index')).toBeTruthy();
        expect(getByText('profile')).toBeTruthy();
    });
});
