import apiClient from '@/src/api/client';
import { Device, SharedUser } from '@/src/types/device';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';

// Fetches the detailed device data with sharedWith populated
const fetchDeviceDetail = async (deviceId: string): Promise<Device> => {
  const res = await apiClient.get<Device>(`/devices/${deviceId}`);
  return res.data;
};

// ─────────────────────────────────────────────────────────────────────────────
// useDeviceDetail
// Provides:
//   - device detail (with populated sharedWith)
//   - shareMutation  → POST /devices/:deviceId/share
//   - revokeMutation → DELETE /devices/:deviceId/share/:userId
// ─────────────────────────────────────────────────────────────────────────────
export const useDeviceDetail = (deviceId: string) => {
  const queryClient = useQueryClient();
  const queryKey = ['device-detail', deviceId];

  const {
    data: device,
    isLoading,
    isError,
    refetch,
  } = useQuery<Device, AxiosError>({
    queryKey,
    queryFn: () => fetchDeviceDetail(deviceId),
    enabled: Boolean(deviceId),
    staleTime: 1000 * 30, // 30 s — fresh enough for a management screen
  });

  // Share with a new user by email
  const shareMutation = useMutation<
    void,
    AxiosError,
    { targetEmail: string }
  >({
    mutationFn: async ({ targetEmail }) => {
      await apiClient.post(`/devices/${deviceId}/share`, { targetEmail });
    },
    onSuccess: () => {
      // Invalidate both the detail and the devices list so isOwner badges refresh
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  // Revoke access from a user
  const revokeMutation = useMutation<void, AxiosError, { userId: string }>({
    mutationFn: async ({ userId }) => {
      await apiClient.delete(`/devices/${deviceId}/share/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['devices'] });
    },
  });

  // Helper: get sharedWith array typed as SharedUser[]
  const sharedUsers: SharedUser[] =
    (device?.sharedWith as SharedUser[])?.filter(
      (u) => typeof u === 'object'
    ) ?? [];

  return {
    device,
    isLoading,
    isError,
    refetch,
    sharedUsers,
    shareMutation,
    revokeMutation,
  };
};
