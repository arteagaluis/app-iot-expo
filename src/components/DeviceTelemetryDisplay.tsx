import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { Text, View } from '@/src/tw';

export const DeviceTelemetryDisplay = ({ deviceId }: { deviceId: string }) => {
  const { data: telemetry } = useQuery({
    queryKey: ['telemetry', deviceId],
    // No hacemos fetch HTTP, solo esperamos que el socket alimente esta queryKey
    staleTime: Infinity,
  });

  return (
    <>
      <View className="flex-row gap-3">
        <View className="flex-1 bg-black/40 p-3 rounded-2xl" style={{ borderCurve: 'continuous' }}>
          <Text className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Temp</Text>
          <Text className="text-white text-xl font-bold mt-1">
            {telemetry?.temperature ? `${telemetry.temperature}°C` : '--'}
          </Text>
        </View>
        <View className="flex-1 bg-black/40 p-3 rounded-2xl" style={{ borderCurve: 'continuous' }}>
          <Text className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider">Humidity</Text>
          <Text className="text-white text-xl font-bold mt-1">
            {telemetry?.humidity ? `${telemetry.humidity}%` : '--'}
          </Text>
        </View>
      </View>

      <View className="bg-iot-primary p-4 rounded-2xl flex-row items-center justify-between mt-1" style={{ borderCurve: 'continuous' }}>
        <View className="gap-0.5">
          <Text className="text-white/80 font-bold uppercase text-[10px] tracking-widest">Energy Usage</Text>
          <Text className="text-white text-lg font-black">
            {telemetry?.energy ? `${telemetry.energy} kW/h` : '--'}
          </Text>
        </View>
      </View>
    </>
  );
};
