import apiClient from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth-store';
import { Image, Pressable, Text, View } from '@/src/tw';
import { BlurView } from 'expo-blur';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;

// ────────────────────────────────────────────────
// Auth Loading Overlay
// ────────────────────────────────────────────────
function AuthLoadingOverlay({ message }: { message: string }) {
  // Pulsing glow ring animation
  const glowScale = useSharedValue(1);
  const glowOpacity = useSharedValue(0.6);

  useEffect(() => {
    glowScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      false,
    );
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.15, { duration: 900 }),
        withTiming(0.5, { duration: 900 }),
      ),
      -1,
      false,
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: glowScale.value }],
    opacity: glowOpacity.value,
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(400)}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 99,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Blur backdrop */}
      <BlurView
        tint="dark"
        intensity={90}
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.65)',
        }}
      />

      {/* Card */}
      <Animated.View
        entering={FadeInDown.duration(400).springify().damping(18)}
        style={{
          alignItems: 'center',
          gap: 20,
          padding: 40,
          borderRadius: 32,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(255,255,255,0.06)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          ...(Platform.OS !== 'ios' ? {} : { borderCurve: 'continuous' }),
        }}
      >
        {/* Pulsing glow ring behind spinner */}
        <View style={{ width: 72, height: 72, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={[
              {
                position: 'absolute',
                width: 72,
                height: 72,
                borderRadius: 36,
                backgroundColor: '#007AFF',
              },
              ringStyle,
            ]}
          />
          {/* Spinner circle */}
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: 'rgba(0,0,0,0.8)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1.5,
              borderColor: 'rgba(0, 122, 255, 0.5)',
            }}
          >
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        </View>

        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text className="text-white font-bold text-lg">{message}</Text>
          <Text className="text-gray-500 text-sm text-center">
            Un momento, por favor...
          </Text>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

// ────────────────────────────────────────────────
// Login Screen
// ────────────────────────────────────────────────
export default function LoginScreen() {
  const { setAuth } = useAuthStore();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authMessage, setAuthMessage] = useState('Iniciando sesión...');
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,
    androidClientId: ANDROID_CLIENT_ID,
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
    redirectUri: makeRedirectUri({
      scheme: 'teliot',
      native: 'com.teliot.app:/oauth2redirect/google',
      preferLocalhost: typeof window !== 'undefined',
    }),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.params.id_token || response.authentication?.idToken;
      if (idToken) {
        setAuthMessage('Verificando cuenta...');
        handleGoogleLogin(idToken);
      } else {
        setIsAuthenticating(false);
        setError('No se pudo obtener el token de Google.');
      }
    } else if (response?.type === 'dismiss' || response?.type === 'cancel') {
      // User cancelled — reset loading state cleanly
      setIsAuthenticating(false);
    } else if (response?.type === 'error') {
      setIsAuthenticating(false);
      setError('Error al autenticarse con Google.');
    }
  }, [response]);

  const handleGoogleLogin = async (idToken: string) => {
    setError(null);
    try {
      setAuthMessage('Conectando con tu cuenta...');
      const res = await apiClient.post('/auth/google', { idToken });
      const { accessToken, refreshToken, user } = res.data;

      setAuthMessage('¡Bienvenido de vuelta!');
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      // Small pause so the "¡Bienvenido!" message is visible before navigating
      await new Promise(res => setTimeout(res, 600));
      await setAuth(accessToken, refreshToken, user.id, user);
    } catch (err: any) {
      console.error('Error en el servicio del backend:', err.response?.data || err.message);
      if (Platform.OS === 'ios') {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      setError('Error al conectar con el servidor. Inténtalo de nuevo.');
      setIsAuthenticating(false);
    }
  };

  const handlePressGoogle = async () => {
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    setError(null);
    setIsAuthenticating(true);
    setAuthMessage('Abriendo Google...');
    await promptAsync();
  };

  const handleTestLogin = () => {
    if (Platform.OS === 'ios') Haptics.selectionAsync();
    setError(null);
    setIsAuthenticating(true);
    setAuthMessage('Iniciando sesión de prueba...');
    handleGoogleLogin('prueba');
  };

  return (
    <View className="flex-1 bg-black justify-center items-center p-8">
      {/* Logo & title */}
      <Animated.View
        entering={FadeInDown.duration(1000).springify()}
        style={{ alignItems: 'center', gap: 16 }}
      >
        <Image
          source={require('@/assets/images/logo.png')}
          className="w-40 h-40 rounded-3xl"
        />
        <View style={{ alignItems: 'center' }}>
          <Text className="text-4xl font-bold text-white tracking-tight">teliot</Text>
          <Text className="text-gray-400 text-lg">Smart Home Connect</Text>
        </View>
      </Animated.View>

      {/* Buttons */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(1000).springify()}
        style={{ width: '100%', marginTop: 80 }}
      >
        {/* Error message */}
        {error && (
          <Animated.View
            entering={FadeInDown.duration(300)}
            exiting={FadeOut.duration(200)}
            style={{
              backgroundColor: 'rgba(255,59,48,0.12)',
              borderWidth: 1,
              borderColor: 'rgba(255,59,48,0.3)',
              borderRadius: 14,
              padding: 14,
              marginBottom: 16,
            }}
          >
            <Text style={{ color: '#FF3B30', textAlign: 'center', fontSize: 14, fontWeight: '500' }}>
              {error}
            </Text>
          </Animated.View>
        )}

        <Pressable
          disabled={!request || isAuthenticating}
          onPress={handlePressGoogle}
          className="bg-white py-4 rounded-2xl flex-row justify-center items-center gap-3"
          style={{
            opacity: isAuthenticating ? 0.5 : 1,
            boxShadow: '0 10px 30px rgba(0, 122, 255, 0.3)',
            borderCurve: 'continuous',
          }}
        >
          <Image
            source={{ uri: 'https://www.google.com/favicon.ico' }}
            className="w-6 h-6"
          />
          <Text className="text-black font-semibold text-lg">
            Sign in with Google
          </Text>
        </Pressable>

        {/* BOTÓN TEST */}
        <Pressable
          disabled={isAuthenticating}
          onPress={handleTestLogin}
          className="bg-gray-800 py-4 mt-4 rounded-2xl flex-row justify-center items-center gap-3"
          style={{
            opacity: isAuthenticating ? 0.5 : 1,
            borderCurve: 'continuous',
            borderWidth: 1,
            borderColor: '#333',
          }}
        >
          <Text className="text-white font-semibold text-lg">
            Test Fake Login
          </Text>
        </Pressable>

        <Text className="text-gray-500 text-center mt-6 text-sm">
          Simple. Secure. Smart.
        </Text>
      </Animated.View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: 48, alignItems: 'center' }}>
        <Text className="text-gray-600 font-medium">Designed for the Future</Text>
      </View>

      {/* Full-screen Auth Loading Overlay */}
      {isAuthenticating && <AuthLoadingOverlay message={authMessage} />}
    </View>
  );
}
