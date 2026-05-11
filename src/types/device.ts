export interface Device {
  _id?: string;
  id?: string;
  mac?: string;
  deviceId?: string;
  name: string;
  type?: 'light' | 'temp' | 'lock' | string;
  isOnline?: boolean;
  room?: string;
  value?: string | number | boolean;
  unit?: string;
  // Backend fields
  ownerId?: string;
  sharedWith?: string[];
  status?: 'pending' | 'active' | 'inactive';
  isOwner?: boolean; // true = propietario, false = acceso compartido
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  [key: string]: any;
}
