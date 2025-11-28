import { NativeEventEmitter, NativeModules } from 'react-native';

export enum Events {
  NOTIFICATION_PERMISSIONS_REQUESTED = 'notificationapi_notification_permissions_requested',
  NOTIFICATION_ON_CLICK = 'notificationapi_notification_on_click',
  PUSH_TOKEN_RECEIVED = 'notificationapi_push_token_received',
  NOTIFICATION_RECEIVED = 'notificationapi_notification_received',
}

export interface NotificationPermissionsRequestedEvent {
  isGranted: boolean;
}

export interface NotificationOnClickEvent<T extends Record<string, unknown> = Record<string, unknown>> {
  messageId: string;
  senderId: string;
  ttl: number;
  title: string;
  body: string;
  data: T;
}

export interface PushTokenReceivedEvent {
  token: string;
  type: 'FCM' | 'APN';
}

export interface NotificationReceivedEvent {
  messageId: string;
  senderId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

// Event emitter instance
let eventEmitter: NativeEventEmitter | null = null;

export function getEventEmitter(): NativeEventEmitter {
  if (!eventEmitter) {
    const { NotificationApiReactNativeSdk } = NativeModules;
    eventEmitter = new NativeEventEmitter(NotificationApiReactNativeSdk);
  }
  return eventEmitter;
}

