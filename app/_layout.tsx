import { useAuthStore } from '@/src/stores/auth-store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as WebBrowser from 'expo-web-browser';
import { useEffect } from 'react';
import '../src/global.css';

WebBrowser.maybeCompleteAuthSession();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    if (isLoading) return;

    // On Web, if we are in a popup (window.opener exists), 
    // we don't want to perform any redirection logic.
    // WebBrowser.maybeCompleteAuthSession() will handle closing this window.
    if (typeof window !== 'undefined' && window.opener && window.opener !== window) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to dashboard if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  return (
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#000' } }}>
        <Stack.Screen name="(auth)/login" options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
        <Stack.Screen
          name="device/[deviceId]/share-manager"
          options={{
            presentation: 'formSheet',
            headerShown: true,
            animation: 'slide_from_bottom',
            headerStyle: { backgroundColor: '#000' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: '700' },
          }}
        />
      </Stack>
      <StatusBar style="light" />
    </QueryClientProvider>
  );
}
