import { Platform } from 'react-native';
import NativeNotificationApi from './NativeNotificationApi';
import { NotificationAPIService } from './NotificationAPIService';
import { getEventEmitter, Events, PushTokenReceivedEvent } from './events';
import { NotificationAPIException } from './models';
import type { Region, User, PushToken, Device } from './models';

export interface SetupOptions {
  clientId: string;
  userId: string;
  hashedUserId?: string;
  region?: Region;
  autoRequestPermission?: boolean;
  baseUrl?: string;
}

export type { SetupOptions as SetupOptionsType };

class NotificationAPI {
  private static instance: NotificationAPI | null = null;
  private service: NotificationAPIService | null = null;
  private userId: string | null = null;
  private clientId: string | null = null;
  private hashedUserId: string | undefined;
  private region: Region = 'us';
  private baseUrl: string | undefined;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): NotificationAPI {
    if (!NotificationAPI.instance) {
      NotificationAPI.instance = new NotificationAPI();
    }
    return NotificationAPI.instance;
  }

  async setup(options: SetupOptions): Promise<void> {
    const {
      clientId,
      userId,
      hashedUserId,
      region = 'us',
      autoRequestPermission = true,
      baseUrl
    } = options;

    this.clientId = clientId;
    this.userId = userId;
    this.hashedUserId = hashedUserId;
    this.region = region;
    this.baseUrl = baseUrl;

    // Initialize service
    this.service = new NotificationAPIService(
      clientId,
      userId,
      hashedUserId,
      region,
      baseUrl
    );

    // Configure native module
    const nativeModule = NativeNotificationApi;
    if (!nativeModule) {
      throw new NotificationAPIException(
        'Native module not found. Make sure the native module is properly linked.'
      );
    }

    nativeModule.configure(clientId, userId, hashedUserId);

    // Request permission if auto-request is enabled
    if (autoRequestPermission) {
      await this.requestPermission();
    }

    // Get push token and sync with backend
    await this.syncPushToken();

    this.isInitialized = true;
  }

  async requestPermission(): Promise<boolean> {
    const nativeModule = NativeNotificationApi;
    if (!nativeModule) {
      throw new NotificationAPIException('Native module not found');
    }

    try {
      const granted = await nativeModule.requestNotificationPermission();
      return granted;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  async getPushToken(): Promise<string | null> {
    const nativeModule = NativeNotificationApi;
    if (!nativeModule) {
      throw new NotificationAPIException('Native module not found');
    }

    try {
      const token = await nativeModule.getPushToken();
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      return null;
    }
  }

  async getDeviceInfo(): Promise<Device> {
    const nativeModule = NativeNotificationApi;
    if (!nativeModule) {
      throw new NotificationAPIException('Native module not found');
    }

    try {
      const info = await nativeModule.getDeviceInfo();
      return {
        device_id: info.deviceId,
        platform: info.platform || Platform.OS,
        manufacturer: info.manufacturer || undefined,
        model: info.model || undefined,
        app_id: info.appId || undefined
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      throw new NotificationAPIException(
        `Failed to get device info: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  private async syncPushToken(): Promise<void> {
    if (!this.service || !this.userId || !this.clientId) {
      return;
    }

    try {
      const token = await this.getPushToken();
      if (!token) {
        console.warn('Push token not available yet');
        return;
      }

      const deviceInfo = await this.getDeviceInfo();
      // Determine environment for iOS (sandbox vs production)
      // Use 'sandbox' for debug builds, 'production' for release builds
      const pushToken: PushToken = {
        type: Platform.OS === 'ios' ? 'APN' : 'FCM',
        token,
        device: deviceInfo,
        // iOS environment: 'sandbox' for development, 'production' for release
        environment:
          Platform.OS === 'ios'
            ? __DEV__
              ? 'sandbox'
              : 'production'
            : undefined
      };

      const user: User = {
        id: this.userId,
        pushTokens: [pushToken]
      };

      await this.service.identify(user);

      // Emit event
      const eventEmitter = getEventEmitter();
      eventEmitter.emit(Events.PUSH_TOKEN_RECEIVED, {
        token,
        type: pushToken.type
      } as PushTokenReceivedEvent);
    } catch (error) {
      console.error('Error syncing push token:', error);
    }
  }

  getService(): NotificationAPIService {
    if (!this.service) {
      throw new NotificationAPIException(
        'SDK not initialized. Call setup() first.'
      );
    }
    return this.service;
  }

  get isReady(): boolean {
    return this.isInitialized && this.service !== null;
  }

  get currentUser(): string | null {
    return this.userId;
  }
}

export default NotificationAPI.getInstance();
