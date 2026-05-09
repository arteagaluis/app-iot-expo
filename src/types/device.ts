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
}

export interface ApiError {
  message: string;
  statusCode?: number;
  [key: string]: any;
}
