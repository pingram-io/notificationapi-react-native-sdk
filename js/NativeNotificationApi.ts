import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  configure(clientId: string, userId: string, hashedUserId?: string): void;
  requestNotificationPermission(): Promise<boolean>;
  getPushToken(): Promise<string | null>;
  getDeviceInfo(): Promise<{
    deviceId: string;
    platform: string;
    manufacturer: string | null;
    model: string | null;
    appId: string | null;
  }>;
}

export default TurboModuleRegistry.get<Spec>(
  'NotificationApiReactNativeSdk',
) as Spec | null;