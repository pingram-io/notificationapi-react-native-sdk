import type {TurboModule} from 'react-native/Libraries/TurboModule/RCTExport';
import {TurboModuleRegistry} from 'react-native';

export interface Spec extends TurboModule {
  configure(clientId: string, userId: string, hashedUserId?: string): void;

  requestNotificationPermission(): void;
}

export default TurboModuleRegistry.get<Spec>(
  'NotificationApiReactNativeSdk',
) as Spec | null;