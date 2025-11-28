// API endpoints
export const API_ENDPOINTS = {
  us: 'https://api.notificationapi.com',
  eu: 'https://api.eu.notificationapi.com',
  ca: 'https://api.ca.notificationapi.com',
} as const;

export type Region = 'us' | 'eu' | 'ca';

// Channel types
export type Channel = 'EMAIL' | 'INAPP_WEB' | 'SMS' | 'CALL' | 'PUSH' | 'WEB_PUSH' | 'SLACK';

// Delivery options
export type DeliveryOption = 'off' | 'instant' | 'hourly' | 'daily' | 'weekly' | 'monthly';

// Push token providers
export type PushProvider = 'FCM' | 'APN';

// Device information
export interface Device {
  app_id?: string;
  ad_id?: string;
  device_id: string;
  platform?: string;
  manufacturer?: string;
  model?: string;
}

// Push token
export interface PushToken {
  type: PushProvider;
  token: string;
  device: Device;
  environment?: 'sandbox' | 'production';
}

// User information
export interface User {
  id: string;
  email?: string;
  number?: string;
  pushTokens?: PushToken[];
  webPushTokens?: WebPushToken[];
  timezone?: string;
}

// Web push token
export interface WebPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface WebPushToken {
  sub: WebPushSubscription;
}

// In-app notification
export interface InAppNotification {
  id: string;
  notificationId: string;
  subNotificationId?: string;
  seen: boolean;
  title: string;
  redirectURL?: string;
  imageURL?: string;
  date: string;
  parameters?: Record<string, unknown>;
  expDate?: number;
  opened?: string;
  clicked?: string;
  archived?: string;
  actioned1?: string;
  actioned2?: string;
  replies?: {
    date: string;
    message: string;
  }[];
}

// Preference
export interface Preference {
  notificationId: string;
  channel: Channel;
  delivery: DeliveryOption;
  subNotificationId?: string;
}

// Notification config
export interface NotificationConfig {
  notificationId: string;
  title: string;
  channels: Channel[];
  options?: Record<string, unknown>;
}

// Sub notification
export interface SubNotification {
  notificationId: string;
  subNotificationId: string;
  title: string;
}

// Preferences response
export interface GetPreferencesResponse {
  preferences: Preference[];
  notifications: NotificationConfig[];
  subNotifications: SubNotification[];
}

// User account metadata
export interface UserAccountMetadata {
  logo: string;
  environmentVapidPublicKey: string;
  hasWebPushEnabled: boolean;
}

// In-app notifications result
export interface GetInAppNotificationsResult {
  items: InAppNotification[];
  hasMore: boolean;
  oldestReceived: string;
}

// API error
export class NotificationAPIException extends Error {
  statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = 'NotificationAPIException';
    this.statusCode = statusCode;
  }
}

