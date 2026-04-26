import { HapticTab } from '@/src/components/haptic-tab';
import { IconSymbol } from '@/src/components/ui/icon-symbol';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666666',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: () => (
          <BlurView
            tint="dark"
            intensity={80}
            className="absolute inset-0"
            style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
          />
        ),
        tabBarStyle: {
          position: 'absolute',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'ios' ? 88 : 68,
          boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
        },
        tabBarLabelStyle: {
          fontWeight: '700',
          fontSize: 10,
          marginBottom: Platform.OS === 'ios' ? 0 : 8,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="person.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
