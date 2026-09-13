import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { BASE_URL } from '../api/client';
import { useAuthStore } from '../stores/auth-store';

let socket: Socket | null = null;

export const sendCommand = (deviceId: string, command: Record<string, any>) => {
  if (socket && socket.connected) {
    socket.emit('device:command', { deviceId, command }, (response: any) => {
      if (response?.status === 'error') {
        console.error('Error enviando comando:', response.message);
      }
    });
    return true;
  }
  return false;
};

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
    socket.on('device:status', (payload: any) => {
      console.log('Actualización de estado recibida vía socket:', payload);
      // Actualizamos la caché de dispositivos
      queryClient.setQueryData(['devices'], (oldData: any) => {
        if (!oldData) return oldData;
        return oldData.map((device: any) =>
          device.mac === payload.deviceId || device.deviceId === payload.deviceId || device._id === payload.deviceId
            ? { 
                ...device, 
                isOnline: payload.online !== undefined ? payload.online : device.isOnline,
                relay: payload.relay !== undefined ? payload.relay : device.relay 
              } 
            : device
        );
      });

      // Si el payload contiene 'relay', actualizamos también la telemetría para que el componente se entere
      if (payload.relay !== undefined) {
        queryClient.setQueryData(['telemetry', payload.deviceId], (oldTelemetry: any) => ({
          ...oldTelemetry,
          relay: payload.relay
        }));
      }
    });

    socket.on('device:telemetry', (payload: { deviceId?: string; mac?: string; data: any }) => {
      console.log('Telemetría recibida vía socket:', payload);
      const targetId = payload.deviceId || payload.mac;
      if (targetId) {
        queryClient.setQueryData(['telemetry', targetId], (oldTelemetry: any) => ({
          ...oldTelemetry,
          ...payload.data
        }));
      }
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
      }
    };
  }, [token, queryClient]);
};
