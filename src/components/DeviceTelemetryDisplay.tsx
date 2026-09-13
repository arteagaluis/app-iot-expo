import { Pressable, Text, View } from '@/src/tw';
import { Feather } from '@expo/vector-icons';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { sendCommand } from '../hooks/useDeviceSocket';
import { Device } from '../types/device';

export const DeviceTelemetryDisplay = ({ deviceId }: { deviceId: string }) => {
  const queryClient = useQueryClient();
  
  // Obtenemos el estado inicial del relé desde la lista de dispositivos si aún no hay telemetría
  const devices = queryClient.getQueryData<Device[]>(['devices']);
  const device = devices?.find(d => d.deviceId === deviceId || d.mac === deviceId || d._id === deviceId);

  const { data: telemetry } = useQuery({
    queryKey: ['telemetry', deviceId],
    queryFn: () => null,
    staleTime: Infinity,
  });

  // Priorizamos telemetría en tiempo real, luego el estado en la lista de dispositivos
  const currentRelay = telemetry?.relay !== undefined ? telemetry.relay : device?.relay;
  const isRelayOn = currentRelay === 1 || currentRelay === true;

  const toggleRelay = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const nextState = !isRelayOn;
    
    // Enviamos el comando. El dispositivo responderá con un evento de status que actualizará la UI.
    sendCommand(deviceId, { relay: nextState });
  };

  return (
    <>
      <View className="flex-row gap-3">
        <View className="flex-1 bg-black/40 p-3 rounded-2xl" style={{ borderCurve: 'continuous' }}>
          <Text className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
            Temp
          </Text>
          <Text className="text-white text-xl font-bold mt-1">
            {telemetry?.temperature ? `${telemetry.temperature}°C` : '--'}
          </Text>
        </View>
        <View className="flex-1 bg-black/40 p-3 rounded-2xl" style={{ borderCurve: 'continuous' }}>
          <Text className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">
            Humidity
          </Text>
          <Text className="text-white text-xl font-bold mt-1">
            {telemetry?.humidity ? `${telemetry.humidity}%` : '--'}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={toggleRelay}
        className={`${isRelayOn ? 'bg-iot-primary' : 'bg-blue-900/20 border border-blue-900/30'} p-4 rounded-2xl flex-row items-center justify-between mt-1 active:opacity-80`}
        style={{ borderCurve: 'continuous' }}
      >
        <View className="gap-0.5">
          <Text
            className={`${isRelayOn ? 'text-white/80' : 'text-gray-500'} font-bold uppercase text-[10px] tracking-widest`}
          >
            Relay Control
          </Text>
          <Text className="text-white text-lg font-black">
            {isRelayOn ? 'ENCENDIDO' : 'APAGADO'}
          </Text>
        </View>
        <View
          className={`${isRelayOn ? 'bg-white/20' : 'bg-blue-500/10'} w-10 h-10 rounded-full items-center justify-center`}
        >
          <Feather name="power" size={20} color={isRelayOn ? 'white' : '#3b82f6'} />
        </View>
      </Pressable>
    </>
  );
};
