import apiClient from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth-store';
import { Image, Pressable, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { makeRedirectUri } from 'expo-auth-session';
import * as Google from 'expo-auth-session/providers/google';
import * as Haptics from 'expo-haptics';
import React, { useEffect } from 'react';
import { FadeInDown } from 'react-native-reanimated';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_WEB;
const IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_IOS;
const ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID;

export default function LoginScreen() {
    const { setAuth, logout } = useAuthStore();

    const [request, response, promptAsync] = Google.useAuthRequest({
        webClientId: GOOGLE_CLIENT_ID,
        iosClientId: IOS_CLIENT_ID,
        androidClientId: ANDROID_CLIENT_ID,
        responseType: 'id_token',
        scopes: ['openid', 'profile', 'email'],
        redirectUri: makeRedirectUri({
            scheme: 'teliot', // Usado para Development Builds
            native: 'com.teliot.app:/oauth2redirect/google', // Requerido por Google en iOS/Android nativo
            preferLocalhost: typeof window !== 'undefined', // Solo usa localhost si estamos en la Web
        }),
    });

    useEffect(() => {
        // Al entrar a la pantalla de login, limpiamos cualquier rastro de sesión previa
        // para asegurar que el flujo de Google sea de una sesión nueva.
        logout();
    }, []);

    useEffect(() => {
        console.log('Google Auth Response Type:', response?.type);
        if (response?.type === 'success') {
            const idToken = response.params.id_token || response.authentication?.idToken;
            if (idToken) {
                handleGoogleLogin(idToken);
            } else {
                console.error('No idToken found in response:', response);
            }
        }
    }, [response]);

    const handleGoogleLogin = async (idToken: string) => {
        try {
            console.log('ENVIANDO TOKEN AL BACKEND...');
            const res = await apiClient.post('/auth/google', { idToken });
            const { accessToken, refreshToken, user } = res.data;

            await setAuth(accessToken, refreshToken, user.id, user);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        } catch (error: any) {
            console.error('Error en el servicio del backend:', error.response?.data || error.message);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    return (
        <View className="flex-1 bg-black justify-center items-center p-8">
            <Animated.View
                entering={FadeInDown.duration(1000).springify()}
                className="items-center gap-4"
            >
                <Image
                    source={require('@/assets/images/logo.png')}
                    className="w-40 h-40 rounded-3xl"
                />
                <View className="items-center">
                    <Text className="text-4xl font-bold text-white tracking-tight">teliot</Text>
                    <Text className="text-gray-400 text-lg">Smart Home Connect</Text>
                </View>
            </Animated.View>

            <Animated.View
                entering={FadeInDown.delay(400).duration(1000).springify()}
                className="w-full mt-20"
            >
                <Pressable
                    disabled={!request}
                    onPress={() => {
                        Haptics.selectionAsync();
                        promptAsync(); // Re-habilitado
                    }}
                    className="bg-white py-4 rounded-2xl flex-row justify-center items-center gap-3 active:opacity-80"
                    style={{
                        boxShadow: '0 10px 30px rgba(0, 122, 255, 0.3)',
                        borderCurve: 'continuous'
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

                {/* BOTÓN TEST - Llama directamente al backend con un Token falso */}
                <Pressable
                    onPress={() => {
                        Haptics.selectionAsync();
                        handleGoogleLogin('prueba');
                    }}
                    className="bg-gray-800 py-4 mt-4 rounded-2xl flex-row justify-center items-center gap-3 active:opacity-80"
                    style={{
                        borderCurve: 'continuous',
                        borderWidth: 1,
                        borderColor: '#333'
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

            <View className="absolute bottom-12 items-center">
                <Text className="text-gray-600 font-medium">Designed for the Future</Text>
            </View>
        </View>
    );
}
