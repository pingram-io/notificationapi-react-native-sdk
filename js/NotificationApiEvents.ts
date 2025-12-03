export enum Events {
  NOTIFICATION_PERMISSIONS_REQUESTED = 'notificationapi_notification_permissions_requested',
  NOTIFICATION_ON_CLICK = 'notificationapi_notification_on_click'
}

export interface NotificationPermissionsRequestedEvent {
  isGranted: boolean;
}

export interface NotificationOnClickEvent<T extends object = {}> {
  messageId: string;
  senderId: string;
  ttl: number;
  title: string;
  body: string;
  data: T;
}
