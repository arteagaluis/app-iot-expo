import { useDeviceDetail } from '@/src/hooks/useDeviceDetail';
import { SharedUser } from '@/src/types/device';
import { Pressable, Text, TextInput, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import * as Haptics from 'expo-haptics';
import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
} from 'react-native-reanimated';

// ─────────────────────────────────────────────────────────────────────────────
// Shared User Row
// ─────────────────────────────────────────────────────────────────────────────
const UserRow = React.memo(
  ({
    user,
    onRevoke,
    isRevoking,
  }: {
    user: SharedUser;
    onRevoke: (userId: string) => void;
    isRevoking: boolean;
  }) => {
    const initials = user.name
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();

    return (
      <Animated.View
        entering={FadeInDown.springify().damping(18)}
        exiting={FadeOut.duration(250)}
        layout={LinearTransition.springify()}
        className="flex-row items-center gap-3 py-3.5 px-4 bg-white/5 rounded-[18px] border border-white/[0.08]"
        style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.25)' }}
      >
        {/* Avatar */}
        {user.picture ? (
          <Image
            source={{ uri: user.picture }}
            style={{ width: 44, height: 44, borderRadius: 22 }}
            contentFit="cover"
          />
        ) : (
          <View className="w-11 h-11 rounded-full bg-iot-primary/25 items-center justify-center">
            <Text className="text-iot-primary font-bold text-base">{initials}</Text>
          </View>
        )}

        {/* Info */}
        <View className="flex-1 gap-0.5">
          <Text className="text-white font-semibold text-[15px]" numberOfLines={1}>
            {user.name}
          </Text>
          <Text className="text-gray-400 text-[13px]" selectable numberOfLines={1}>
            {user.email}
          </Text>
        </View>

        {/* Revoke button */}
        <Pressable
          onPress={() => {
            if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onRevoke(user._id);
          }}
          disabled={isRevoking}
          className={`bg-red-500/10 rounded-xl border border-red-500/30 p-2.5 ${isRevoking ? 'opacity-50' : 'active:opacity-50'}`}
        >
          {isRevoking ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <Image
              source="sf:person.fill.xmark"
              style={{ width: 18, height: 18, tintColor: '#FF3B30' }}
              contentFit="contain"
            />
          )}
        </Pressable>
      </Animated.View>
    );
  }
);
UserRow.displayName = 'UserRow';

// ─────────────────────────────────────────────────────────────────────────────
// Share Input Banner
// ─────────────────────────────────────────────────────────────────────────────
function ShareInput({
  deviceName,
  onShare,
  isSharing,
}: {
  deviceName: string;
  onShare: (email: string) => void;
  isSharing: boolean;
}) {
  const [email, setEmail] = useState('');
  const inputRef = useRef<React.ElementRef<typeof TextInput>>(null);

  const handleSubmit = () => {
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      Alert.alert('Email inválido', 'Por favor ingresa un email válido.');
      return;
    }
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onShare(trimmed);
    setEmail('');
    inputRef.current?.blur();
  };

  const canSubmit = Boolean(email.trim()) && !isSharing;

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      className="gap-2.5 p-4 bg-white/[0.04] rounded-2xl border border-iot-primary/20"
      style={{ boxShadow: '0 4px 20px rgba(0,122,255,0.1)' }}
    >
      <Text className="text-gray-400 text-xs font-semibold uppercase tracking-widest">
        Invitar a {deviceName}
      </Text>

      <View className="flex-row gap-2.5 items-center">
        <TextInput
          ref={inputRef}
          value={email}
          onChangeText={setEmail}
          placeholder="correo@ejemplo.com"
          placeholderTextColor="rgba(235,235,245,0.3)"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="send"
          onSubmitEditing={handleSubmit}
          className="flex-1 bg-white/[0.07] rounded-[14px] border border-white/10 px-3.5 py-3 text-white text-[15px]"
        />

        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          className={`bg-iot-primary rounded-[14px] px-4 py-3 items-center justify-center ${canSubmit ? 'active:opacity-70' : 'opacity-40'}`}
          style={{ boxShadow: '0 4px 14px rgba(0,122,255,0.4)' }}
        >
          {isSharing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text className="text-white font-bold text-[15px]">Invitar</Text>
          )}
        </Pressable>
      </View>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Share Manager Screen
// ─────────────────────────────────────────────────────────────────────────────
export default function ShareManagerScreen() {
  const { deviceId } = useLocalSearchParams<{ deviceId: string }>();
  const router = useRouter();
  const {
    device,
    isLoading,
    isError,
    sharedUsers,
    shareMutation,
    revokeMutation,
  } = useDeviceDetail(deviceId);

  const handleShare = (email: string) => {
    shareMutation.mutate(
      { targetEmail: email },
      {
        onSuccess: () => {
          if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          Alert.alert('¡Listo!', `Se invitó a ${email} al dispositivo.`);
        },
        onError: (error: any) => {
          const msg = error.response?.data?.message || 'No se pudo compartir el dispositivo.';
          Alert.alert('Error', msg);
        },
      }
    );
  };

  const handleRevoke = (userId: string, userName: string) => {
    Alert.alert(
      'Revocar acceso',
      `¿Quitar el acceso de ${userName} a este dispositivo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar acceso',
          style: 'destructive',
          onPress: () => {
            if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            revokeMutation.mutate(
              { userId },
              {
                onSuccess: () => {
                  if (Platform.OS === 'ios') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                },
                onError: (error: any) => {
                  const msg = error.response?.data?.message || 'No se pudo revocar el acceso.';
                  Alert.alert('Error', msg);
                },
              }
            );
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#000' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen
        options={{
          title: device?.name ? `Compartir: ${device.name}` : 'Gestionar acceso',
          presentation: 'modal',
          headerStyle: { backgroundColor: '#000' },
          headerTintColor: '#fff',
          headerTitleStyle: { color: '#fff', fontWeight: '700' },
          headerBlurEffect: 'dark',
          headerTransparent: true,
          headerShadowVisible: false,
        }}
      />

      {/* ── Loading ── */}
      {isLoading ? (
        <View className="flex-1 items-center justify-center gap-3">
          <ActivityIndicator size="large" color="#007AFF" />
          <Text className="text-gray-500 text-sm">Cargando dispositivo...</Text>
        </View>

      /* ── Error ── */
      ) : isError ? (
        <View className="flex-1 items-center justify-center p-8 gap-5">
          <Text className="text-red-500 text-base font-semibold text-center">
            No se pudo cargar el dispositivo.
          </Text>
          <Pressable
            onPress={() => router.back()}
            className="bg-white/10 rounded-xl px-6 py-3 active:opacity-70"
          >
            <Text className="text-white font-semibold">Volver</Text>
          </Pressable>
        </View>

      /* ── Content ── */
      ) : (
        <FlatList
          data={sharedUsers}
          keyExtractor={(u) => u._id}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 60 }}
          ListHeaderComponent={
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              className="gap-6 mb-2"
            >
              {/* Share input */}
              <ShareInput
                deviceName={device?.name ?? 'dispositivo'}
                onShare={handleShare}
                isSharing={shareMutation.isPending}
              />

              {/* Section title */}
              {sharedUsers.length > 0 && (
                <View className="flex-row items-center gap-2">
                  <Text className="text-gray-500 text-xs font-bold uppercase tracking-widest">
                    Personas con acceso
                  </Text>
                  <View className="bg-iot-primary/20 rounded-full px-2 py-0.5">
                    <Text className="text-iot-primary text-[11px] font-bold">
                      {sharedUsers.length}
                    </Text>
                  </View>
                </View>
              )}
            </Animated.View>
          }
          renderItem={({ item: user }) => (
            <UserRow
              user={user}
              onRevoke={(userId) => handleRevoke(userId, user.name)}
              isRevoking={revokeMutation.isPending && revokeMutation.variables?.userId === user._id}
            />
          )}
          ListEmptyComponent={
            <Animated.View
              entering={FadeIn.delay(200).duration(500)}
              className="items-center gap-2.5 py-8"
            >
              <View className="w-14 h-14 rounded-full bg-white/[0.06] items-center justify-center">
                <Image
                  source="sf:person.2.slash"
                  style={{ width: 28, height: 28, tintColor: 'rgba(235,235,245,0.3)' }}
                  contentFit="contain"
                />
              </View>
              <Text className="text-gray-600 text-sm text-center">
                {'Nadie más tiene acceso\na este dispositivo aún.'}
              </Text>
            </Animated.View>
          }
        />
      )}
    </KeyboardAvoidingView>
  );
}
