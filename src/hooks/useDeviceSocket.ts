import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';
import { useAuthStore } from '../stores/auth-store';

let socket: Socket | null = null;

export const useDeviceSocket = () => {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    if (!token) return;

    // Conectar al backend usando websocket
    socket = io(BASE_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    socket.on('connect', () => {
      console.log('🟢 Conectado al Socket de dispositivos');
    });

    // Escuchar el evento que manda NestJS cuando cambia el estado
    socket.on('device:status', (payload: { deviceId: string; online: boolean; timestamp: string }) => {
      console.log('Actualización de estado recibida vía socket:', payload);
      // Actualizamos la caché de TanStack Query en tiempo real
      queryClient.setQueryData(['devices'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((device: any) =>
          device.mac === payload.deviceId || device.deviceId === payload.deviceId || device._id === payload.deviceId
            ? { ...device, isOnline: payload.online } 
            : device
        );
      });
    });

    socket.on('device:telemetry', (payload: { mac: string; data: any }) => {
      console.log('Telemetría recibida vía socket:', payload);
      // Podríamos guardar la telemetría en otra key de query, ej: ['telemetry', payload.mac]
      queryClient.setQueryData(['telemetry', payload.mac], payload.data);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [token, queryClient]);
};
