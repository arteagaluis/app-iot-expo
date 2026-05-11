import apiClient from '@/src/api/client';
import { useDeviceSocket } from '@/src/hooks/useDeviceSocket';
import { useAuthStore } from '@/src/stores/auth-store';
import { ApiError, Device } from '@/src/types/device';
import { useMutation, UseMutationResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActionSheetIOS, Alert, Platform } from 'react-native';

interface UseDashboardReturn {
  user: any; // Ideally we type User in auth-store too
  devices: Device[];
  isLoadingDevices: boolean;
  selectedDevice: string | null;
  toggleDeviceSelection: (deviceId: string) => void;
  confirmDelete: (id: string, name: string) => void;
  handleEdit: (id: string, currentName: string) => void;
  handleShare: (id: string, name: string) => void;
  deleteMutation: UseMutationResult<any, AxiosError<ApiError>, string>;
  shareMutation: UseMutationResult<any, AxiosError<ApiError>, { id: string; email: string }>;
  updateMutation: UseMutationResult<any, AxiosError<ApiError>, { id: string; name: string }>;
}

export const useDashboard = (): UseDashboardReturn => {
  const { user } = useAuthStore();
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // Iniciar la conexión en tiempo real
  useDeviceSocket();

  // Fetch de dispositivos mediante HTTP
  const { data: devices = [], isLoading: isLoadingDevices } = useQuery<Device[]>({
    queryKey: ['devices'],
    queryFn: async () => {
      const res = await apiClient.get<Device[]>('/devices');
      return res.data;
    },
  });

  // Mutación para eliminar dispositivo
  const deleteMutation = useMutation<any, AxiosError<ApiError>, string>({
    mutationFn: async (id: string) => {
      console.log(`[DELETE] Petición a /devices/${id}`);
      const response = await apiClient.delete(`/devices/${id}`);
      return response.data;
    },
    onSuccess: () => {
      console.log('[DELETE] Éxito. Invalidando caché...');
      queryClient.invalidateQueries({ queryKey: ['devices'] });
      setSelectedDevice(null);
    },
    onError: (error) => {
      console.error('[DELETE] Error:', error.response?.data || error.message);
      Alert.alert(
        'Error de Conexión',
        error.response?.data?.message || 'No se pudo eliminar el dispositivo.'
      );
    },
  });

  // Mutación para actualizar dispositivo
  const updateMutation = useMutation<any, AxiosError<ApiError>, { id: string; name: string }>({
    mutationFn: async ({ id, name }) => {
      console.log(`[PATCH] Petición a /devices/${id} con nombre: ${name}`);
      const response = await apiClient.patch(`/devices/${id}`, { name });
      return response.data;
    },
    onSuccess: () => {
      console.log('[PATCH] Éxito. Invalidando caché...');
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
    onError: (error) => {
      console.error('[PATCH] Error:', error.response?.data || error.message);
      Alert.alert(
        'Error de Conexión',
        error.response?.data?.message || 'No se pudo actualizar el dispositivo.'
      );
    },
  });

  // Mutación para compartir dispositivo
  const shareMutation = useMutation<any, AxiosError<ApiError>, { id: string; email: string }>({
    mutationFn: async ({ id, email }) => {
      console.log(`[SHARE] Petición a /devices/${id}/share con email: ${email}`);
      const res = await apiClient.post(`/devices/${id}/share`, {
        targetEmail: email,
      });
      return res.data;
    },
    onSuccess: () => {
      console.log('[SHARE] Éxito.');
      if (Platform.OS === 'web') {
        window.alert('Device shared successfully!');
      } else {
        Alert.alert('Success', 'Device shared successfully!');
      }
    },
    onError: (error) => {
      const msg = error.response?.data?.message || 'Failed to share device.';
      console.error('[SHARE] Error:', msg);
      if (Platform.OS === 'web') {
        window.alert('Error: ' + msg);
      } else {
        Alert.alert('Error', msg);
      }
    },
  });

  const confirmDelete = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      const confirm = window.confirm(`Are you sure you want to remove ${name} from your home?`);
      if (confirm) {
        deleteMutation.mutate(id);
      }
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert('Delete Device', `Are you sure you want to remove ${name} from your home?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          deleteMutation.mutate(id);
        },
      },
    ]);
  };

  const handleEdit = (id: string, currentName: string) => {
    if (Platform.OS === 'web') {
      const newName = window.prompt('Enter a new name for your device', currentName);
      if (newName && newName.trim() !== '') {
        updateMutation.mutate({ id, name: newName.trim() });
      }
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.prompt(
      'Edit Device',
      'Enter a new name for your device',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: (newName?: string) => {
            if (newName && newName.trim() !== '') {
              updateMutation.mutate({ id, name: newName.trim() });
            }
          },
        },
      ],
      'plain-text',
      currentName
    );
  };

  const handleShare = (id: string, name: string) => {
    if (Platform.OS === 'ios') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const navigateToManager = () =>
      router.push(`/device/${id}/share-manager`);

    const promptNewShare = () => {
      if (Platform.OS === 'web') {
        const email = window.prompt(`Ingresa el email del usuario para compartir ${name}:`);
        if (email?.trim()) shareMutation.mutate({ id, email: email.trim() });
        return;
      }
      Alert.prompt(
        'Compartir dispositivo',
        `Ingresa el email del usuario al que quieres dar acceso a "${name}":`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Compartir',
            onPress: (email?: string) => {
              if (email?.trim()) shareMutation.mutate({ id, email: email.trim() });
            },
          },
        ],
        'plain-text'
      );
    };

    // iOS: native action sheet for best UX
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          title: name,
          message: '¿Qué deseas hacer?',
          options: ['Cancelar', 'Compartir con alguien', 'Ver usuarios con acceso'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) promptNewShare();
          if (buttonIndex === 2) navigateToManager();
        }
      );
      return;
    }

    // Android / Web: Alert with buttons
    Alert.alert(
      name,
      '¿Qué deseas hacer?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Compartir con alguien', onPress: promptNewShare },
        { text: 'Ver usuarios con acceso', onPress: navigateToManager },
      ]
    );
  };

  const toggleDeviceSelection = (deviceId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedDevice((prev) => (prev === deviceId ? null : deviceId));
  };

  return {
    user,
    devices,
    isLoadingDevices,
    selectedDevice,
    toggleDeviceSelection,
    confirmDelete,
    handleEdit,
    handleShare,
    deleteMutation,
    shareMutation,
    updateMutation,
  };
};
