import { useAuthStore } from '@/src/stores/auth-store';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import * as Haptics from 'expo-haptics';
import React, { useState } from 'react';
import { FadeInDown, LinearTransition } from 'react-native-reanimated';

const DEVICES = [
  { id: '1', name: 'Living Room Light', type: 'light', room: 'Living Room', status: 'On', value: 80 },
  { id: '2', name: 'Air Conditioner', type: 'temp', room: 'Bedroom', status: 'Off', value: 24, unit: '°C' },
  { id: '3', name: 'Smart Lock', type: 'lock', room: 'Front Door', status: 'Locked' },
  { id: '4', name: 'Humidifier', type: 'humid', room: 'Office', status: 'On', value: 45, unit: '%' },
  { id: '5', name: 'TV Backlight', type: 'light', room: 'Living Room', status: 'Off', value: 0 },
  { id: '6', name: 'Studio Speakers', type: 'audio', room: 'Office', status: 'On', value: 20, unit: '%' },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const renderBadge = (type: string) => {
    switch (type) {
      case 'light': return <Text className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-xs font-semibold">Light</Text>;
      case 'temp': return <Text className="bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full text-xs font-semibold">Temp</Text>;
      case 'lock': return <Text className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full text-xs font-semibold">Lock</Text>;
      default: return <Text className="bg-gray-500/20 text-gray-500 px-2 py-0.5 rounded-full text-xs font-semibold">Device</Text>;
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-black"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="p-6 gap-8 pb-32"
    >
      <View>
        <Text className="text-gray-400 text-lg font-medium">Welcome back,</Text>
        <Text className="text-white text-4xl font-bold tracking-tight">{user?.name || 'Home'}</Text>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-gray-900/50 p-5 rounded-3xl" style={{ borderCurve: 'continuous' }}>
          <Text className="text-gray-500 text-sm font-semibold uppercase">Indoor Temp</Text>
          <Text className="text-white text-3xl font-bold mt-1">22.4°C</Text>
        </View>
        <View className="flex-1 bg-gray-900/50 p-5 rounded-3xl" style={{ borderCurve: 'continuous' }}>
          <Text className="text-gray-500 text-sm font-semibold uppercase">Humidity</Text>
          <Text className="text-white text-3xl font-bold mt-1">42%</Text>
        </View>
      </View>

      <View className="gap-4">
        <View className="flex-row justify-between items-center px-1">
          <Text className="text-white text-2xl font-bold">Your Devices</Text>
          <Pressable>
            <Text className="text-iot-primary font-semibold">Add New</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap gap-4">
          {DEVICES.map((device, index) => (
            <Animated.View
              layout={LinearTransition}
              entering={FadeInDown.delay(index * 100).duration(800).springify()}
              key={device.id}
              className="w-[47%]"
            >
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setSelectedDevice(device.id === selectedDevice ? null : device.id);
                }}
                className={`p-5 rounded-3xl border ${device.status === 'On' || device.status === 'Locked' ? 'bg-iot-primary/10 border-iot-primary/30' : 'bg-gray-900/40 border-gray-800/30'}`}
                style={{ borderCurve: 'continuous', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
              >
                <View className="flex-row justify-between mb-4">
                  {renderBadge(device.type)}
                  <View className={`w-3 h-3 rounded-full ${device.status === 'On' || device.status === 'Locked' ? 'bg-iot-primary shadow-[0_0_10px_#007AFF]' : 'bg-gray-700'}`} />
                </View>

                <Text className="text-white font-bold text-lg leading-tight" numberOfLines={1}>{device.name}</Text>
                <Text className="text-gray-500 text-sm mt-1">{device.room}</Text>

                <View className="mt-4 flex-row items-baseline gap-1">
                  <Text className={`text-xl font-bold ${device.status === 'On' || device.status === 'Locked' ? 'text-white' : 'text-gray-600'}`}>
                    {device.value ?? device.status}
                  </Text>
                  {device.unit && <Text className="text-gray-600 text-sm font-medium">{device.unit}</Text>}
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>

      <View className="mt-4 bg-iot-primary p-6 rounded-[40px] flex-row items-center justify-between" style={{ borderCurve: 'continuous' }}>
        <View className="gap-1">
          <Text className="text-white/80 font-bold uppercase text-xs tracking-widest">Energy Usage</Text>
          <Text className="text-white text-2xl font-black">1.4 kW/h</Text>
        </View>
        <View className="bg-black/10 px-4 py-2 rounded-2xl">
          <Text className="text-white font-bold">Details</Text>
        </View>
      </View>
    </ScrollView>
  );
}
