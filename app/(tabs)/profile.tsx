import apiClient from '@/src/api/client';
import { useAuthStore } from '@/src/stores/auth-store';
import { Image, Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { FadeInDown } from 'react-native-reanimated';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      setProfileData(res.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logout();
  };

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-8 gap-10"
    >
      <Animated.View
        entering={FadeInDown.duration(800).springify()}
        className="items-center"
      >
        <Image
          source={{ uri: user?.picture || 'https://via.placeholder.com/150' }}
          className="w-32 h-32 rounded-full border-4 border-iot-primary/20"
          style={{ boxShadow: '0 10px 40px rgba(0, 122, 255, 0.2)' }}
        />
        <Text className="text-white text-3xl font-bold mt-6 tracking-tight">{user?.name}</Text>
        <Text className="text-gray-500 text-lg font-medium">{user?.email}</Text>
      </Animated.View>

      <View className="gap-4">
        <Text className="text-white/60 font-bold uppercase tracking-widest text-xs px-2 mb-2">Account Settings</Text>

        <View className="bg-gray-900/40 rounded-3xl overflow-hidden p-6 gap-6" style={{ borderCurve: 'continuous' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-bold">Personal Info</Text>
              <Text className="text-gray-500 font-medium text-sm mt-0.5">Manage your identity</Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
              <Text className="text-white">→</Text>
            </View>
          </View>

          <View className="h-px bg-gray-800" />

          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-bold">Privacy & Security</Text>
              <Text className="text-gray-500 font-medium text-sm mt-0.5">Protected by teliot Guard</Text>
            </View>
            <View className="w-8 h-8 rounded-full bg-gray-800 items-center justify-center">
              <Text className="text-white">→</Text>
            </View>
          </View>
        </View>

        <View className="bg-gray-900/40 rounded-3xl overflow-hidden p-6 gap-6 mt-4" style={{ borderCurve: 'continuous' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-lg font-bold">Home Configuration</Text>
              <Text className="text-gray-500 font-medium text-sm mt-0.5">3 Connected Nodes</Text>
            </View>
            <Text className="text-iot-primary font-bold">Manage</Text>
          </View>
        </View>
      </View>

      <View className="mt-10">
        <Pressable
          onPress={handleLogout}
          className="bg-red-500/10 py-5 rounded-3xl flex-row justify-center items-center gap-3 border border-red-500/20 active:bg-red-500/20"
          style={{ borderCurve: 'continuous' }}
        >
          <Text className="text-red-500 font-bold text-lg">Sign Out</Text>
        </Pressable>
        <Text className="text-gray-700 text-center mt-6 font-medium text-sm">v1.2.4 Premium Build</Text>
      </View>
    </ScrollView>
  );
}
