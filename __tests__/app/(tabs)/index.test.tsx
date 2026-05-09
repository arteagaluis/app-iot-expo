import Dashboard from '@/app/(tabs)/index';
import { useAuthStore } from '@/src/stores/auth-store';
import { render } from '@testing-library/react-native';
import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderWithClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
};

describe('Dashboard', () => {
    it('renders welcome message with user name', () => {
        useAuthStore.setState({ user: { id: '1', name: 'Luis', email: '', picture: '' } });

        const { getByText } = renderWithClient(<Dashboard />);
        expect(getByText('Welcome back,')).toBeTruthy();
        expect(getByText('Luis')).toBeTruthy();
    });

    it('renders device list', () => {
        const { getByText } = renderWithClient(<Dashboard />);
        // By default it shows loading state or empty state
        expect(getByText('Your Devices')).toBeTruthy();
    });
});
