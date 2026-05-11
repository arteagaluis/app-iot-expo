// Represents a user populated inside device.sharedWith from the detail endpoint
export interface SharedUser {
  _id: string;
  email: string;
  name: string;
  picture?: string;
}

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
  sharedWith?: SharedUser[] | string[]; // populated on detail, IDs on list
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
