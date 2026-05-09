import { DeviceTelemetryDisplay } from '@/src/components/DeviceTelemetryDisplay';
import { useDashboard } from '@/src/hooks/useDashboard';
import { Pressable, ScrollView, Text, View } from '@/src/tw';
import { Animated } from '@/src/tw/animated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, { memo } from 'react';
import { FadeInDown, LinearTransition } from 'react-native-reanimated';
import { Device } from '@/src/types/device';

interface DeviceItemProps {
  device: Device;
  isSelected: boolean;
  toggleDeviceSelection: (deviceId: string) => void;
  confirmDelete: (id: string, name: string) => void;
  handleEdit: (id: string, currentName: string) => void;
  handleShare: (id: string, name: string) => void;
  isDeleting: boolean;
  isSharing: boolean;
}

// Para buenas prácticas de performance (react-native-best-practices), extraemos el item de la lista a un componente memoizado.
// Esto evita que todos los dispositivos se vuelvan a renderizar al cambiar el estado global (ej. selection)
const DeviceItem = memo(({ device, isSelected, toggleDeviceSelection, confirmDelete, handleEdit, handleShare, isDeleting, isSharing }: DeviceItemProps) => {
  const deviceId = device.deviceId || device._id || '';

  const renderBadge = (type: string = 'light') => {
    switch (type) {
      case 'light': return <Text className="bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Light</Text>;
      case 'temp': return <Text className="bg-blue-500/20 text-blue-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Temp</Text>;
      case 'lock': return <Text className="bg-red-500/20 text-red-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Lock</Text>;
      default: return <Text className="bg-gray-500/20 text-gray-500 px-2 py-0.5 rounded-full text-[10px] font-bold">Device</Text>;
    }
  };

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18).stiffness(150)}
      entering={FadeInDown.springify()}
      className={isSelected ? "w-full" : "w-[47%]"}
    >
      <View
        className={`rounded-3xl border overflow-hidden ${device.isOnline ? 'bg-blue-950/20 border-blue-900/30' : 'bg-gray-900/40 border-gray-800/30 opacity-50'}`}
        style={{ borderCurve: 'continuous', boxShadow: '0 4px 15px rgba(0,0,0,0.2)' }}
      >
        <Pressable
          onPress={() => toggleDeviceSelection(deviceId)}
          disabled={!device.isOnline}
          className="p-5"
        >
          <View className="flex-row justify-between mb-4">
            {renderBadge(device.type || 'light')}
            <View
              className={`w-3 h-3 rounded-full ${device.isOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`}
            />
          </View>

          <Text className="text-white font-bold text-lg leading-tight" numberOfLines={1}>{device.name}</Text>
          <Text className="text-gray-500 text-sm mt-1">{device.room || 'Living Room'}</Text>

          <View className="mt-4 flex-row items-baseline gap-1">
            <Text className={`text-xl font-bold ${device.isOnline ? 'text-white' : 'text-gray-600'}`}>
              {device.value ?? (device.isOnline ? 'On' : 'Off')}
            </Text>
            {device.unit && <Text className="text-gray-600 text-sm font-medium">{device.unit}</Text>}
          </View>
        </Pressable>

        {isSelected && (
          <Animated.View entering={FadeInDown.springify().damping(18).stiffness(150)} className="px-5 pb-5 gap-3">
            <View className="h-[1px] w-full bg-blue-900/30 mb-2" />

            <DeviceTelemetryDisplay deviceId={device.mac || deviceId} />

            {/* Device Actions */}
            <View className="flex-row gap-2 mt-2">
              <Pressable
                className="flex-1 bg-red-500/10 p-3 rounded-xl items-center justify-center flex-row gap-2 border border-red-500/20 active:bg-red-500/20"
                style={{ borderCurve: 'continuous' }}
                onPress={() => confirmDelete(deviceId, device.name)}
                disabled={isDeleting}
              >
                <Feather name="trash-2" size={16} color="#ef4444" />
              </Pressable>

              <Pressable
                className="flex-1 bg-blue-500/10 p-3 rounded-xl items-center justify-center flex-row gap-2 border border-blue-500/20 active:bg-blue-500/20"
                style={{ borderCurve: 'continuous' }}
                onPress={() => handleEdit(deviceId, device.name)}
              >
                <Feather name="edit-2" size={16} color="#3b82f6" />
              </Pressable>

              <Pressable
                className="flex-1 bg-green-500/10 p-3 rounded-xl items-center justify-center flex-row gap-2 border border-green-500/20 active:bg-green-500/20"
                style={{ borderCurve: 'continuous' }}
                onPress={() => handleShare(deviceId, device.name)}
                disabled={isSharing}
              >
                <Feather name="share-2" size={16} color="#22c55e" />
              </Pressable>
            </View>

          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}, (prevProps, nextProps) => {
  return prevProps.isSelected === nextProps.isSelected 
    && prevProps.device === nextProps.device
    && prevProps.isDeleting === nextProps.isDeleting
    && prevProps.isSharing === nextProps.isSharing;
});
DeviceItem.displayName = 'DeviceItem';

export default function Dashboard() {
  const {
    user,
    devices,
    isLoadingDevices,
    selectedDevice,
    toggleDeviceSelection,
    confirmDelete,
    handleEdit,
    handleShare,
    deleteMutation,
    shareMutation
  } = useDashboard();

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

      <View className="gap-4">
        <View className="flex-row justify-between items-center px-1">
          <Text className="text-white text-2xl font-bold">Your Devices</Text>
          {devices.length > 0 && (
            <Pressable onPress={() => Haptics.selectionAsync()}>
              <Text className="text-iot-primary font-semibold">Add New</Text>
            </Pressable>
          )}
        </View>

        {isLoadingDevices ? (
          <View className="bg-gray-900/40 rounded-3xl p-6 items-center justify-center h-32" style={{ borderCurve: 'continuous' }}>
            <Text className="text-gray-500 font-medium animate-pulse">Loading devices...</Text>
          </View>
        ) : devices.length === 0 ? (
          <Pressable
            className="bg-[#0B1320] rounded-3xl p-8 items-center justify-center gap-3 border border-blue-900/30 active:bg-blue-900/20 min-h-[160px]"
            style={{ borderCurve: 'continuous' }}
            onPress={() => Haptics.selectionAsync()}
          >
            <View className="w-12 h-12 rounded-full bg-blue-500/20 items-center justify-center">
              <Text className="text-blue-500 text-2xl mb-1">+</Text>
            </View>
            <Text className="text-white text-lg font-bold">Add device</Text>
          </Pressable>
        ) : (
          <View className="flex-row flex-wrap gap-4">
            {devices.map((device: Device) => {
              const deviceId = device.deviceId || device._id || '';
              const isSelected = selectedDevice === deviceId;

              return (
                <DeviceItem 
                  key={deviceId}
                  device={device}
                  isSelected={isSelected}
                  toggleDeviceSelection={toggleDeviceSelection}
                  confirmDelete={confirmDelete}
                  handleEdit={handleEdit}
                  handleShare={handleShare}
                  isDeleting={deleteMutation.isPending}
                  isSharing={shareMutation.isPending}
                />
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
