import LoginScreen from '@/app/(auth)/login';
import { fireEvent, render } from '@testing-library/react-native';
import * as Google from 'expo-auth-session/providers/google';
import React from 'react';

jest.mock('expo-auth-session/providers/google');

jest.mock('@/src/tw/animated', () => {
    const React = require('react');
    const { View } = require('react-native');
    return {
        Animated: {
            View: ({ children, testID }: any) => React.createElement(View, { testID }, children),
        },
    };
});


describe('LoginScreen', () => {
    it('renders correctly', () => {
        (Google.useAuthRequest as jest.Mock).mockReturnValue([{}, null, jest.fn()]);

        const { getByText } = render(<LoginScreen />);
        expect(getByText('teliot')).toBeTruthy();
        expect(getByText('Sign in with Google')).toBeTruthy();
    });

    it('calls promptAsync when sign in button is pressed', () => {
        const promptAsync = jest.fn();
        (Google.useAuthRequest as jest.Mock).mockReturnValue([{ type: 'request' }, null, promptAsync]);

        const { getByText } = render(<LoginScreen />);
        const button = getByText('Sign in with Google');

        fireEvent.press(button);
        expect(promptAsync).toHaveBeenCalled();
    });
});
