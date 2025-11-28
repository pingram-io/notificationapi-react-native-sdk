import NotificationAPI, { type SetupOptions } from './NotificationAPI';
import { NotificationAPIService } from './NotificationAPIService';
import { getEventEmitter, Events } from './events';
import type {
  Region,
  User,
  PushToken,
  Device,
  InAppNotification,
  GetPreferencesResponse,
  GetInAppNotificationsResult,
  Preference,
  Channel,
  DeliveryOption,
  NotificationAPIException,
} from './models';

// Export main SDK instance
export default NotificationAPI;

// Export types
export type {
  Region,
  User,
  PushToken,
  Device,
  InAppNotification,
  GetPreferencesResponse,
  GetInAppNotificationsResult,
  Preference,
  Channel,
  DeliveryOption,
  SetupOptions,
};

// Export classes
export { NotificationAPI, NotificationAPIService, NotificationAPIException };

// Export events
export { Events, getEventEmitter };

// Export event types
export type {
  NotificationPermissionsRequestedEvent,
  NotificationOnClickEvent,
  PushTokenReceivedEvent,
  NotificationReceivedEvent,
} from './events';

