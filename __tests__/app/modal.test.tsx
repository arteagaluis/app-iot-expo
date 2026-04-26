import ModalScreen from '@/app/modal';
import { render } from '@testing-library/react-native';
import React from 'react';

describe('ModalScreen', () => {
    it('renders modal text and link', () => {
        const { getByText } = render(<ModalScreen />);

        expect(getByText('This is a modal')).toBeTruthy();
        expect(getByText('Go to home screen')).toBeTruthy();
    });
});
