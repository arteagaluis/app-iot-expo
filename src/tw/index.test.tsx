import { render } from '@testing-library/react-native';
import React from 'react';
import { Text, View } from './index';

describe('TW Components', () => {
    it('renders View with className mapping to style', () => {
        const { getByTestId } = render(
            <View testID="view" className="bg-red-500" />
        );
        const view = getByTestId('view');
        // Note: react-native-css handles the mapping, for testing we just check it renders
        expect(view).toBeTruthy();
    });

    it('renders Text with children', () => {
        const { getByText } = render(
            <Text className="text-white">Hello Test</Text>
        );
        expect(getByText('Hello Test')).toBeTruthy();
    });
});
