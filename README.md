# NotificationAPI React Native SDK

A React Native SDK for integrating [NotificationAPI](https://notificationapi.com) push notifications into your mobile app.

## Features

- **Cross-platform push notifications**: Full support for Android (FCM) and iOS (APN)
- **One-call setup**: Simple `setup()` method handles initialization, user identification, and permission requests
- **Automatic token syncing**: Push tokens are automatically synced with NotificationAPI backend
- **Event handling**: Listen to notification received and opened events
- **Device information**: Automatic device information collection
- **Region support**: Support for US, EU, and CA regions

## Installation

```bash
npm install notificationapi-react-native-sdk
# or
yarn add notificationapi-react-native-sdk
```

### iOS Setup

1. **Install CocoaPods dependencies** (if using CocoaPods):
   ```bash
   cd ios && pod install && cd ..
   ```

2. **Enable Push Notifications capability** in Xcode:
   - Open your project in Xcode
   - Select your target
   - Go to "Signing & Capabilities"
   - Click "+ Capability" and add "Push Notifications"

3. **Configure APN**:
   - You need an Apple Developer account
   - Create an APN key in Apple Developer Console
   - Configure your NotificationAPI account with the APN key

4. **Update AppDelegate** (if needed):
   The SDK handles most of the setup, but you may need to ensure your `AppDelegate.m` or `AppDelegate.swift` properly handles APN token registration:

   ```swift
   // Swift
   import UserNotifications
   
   func application(_ application: UIApplication, 
                    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
     let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
     UserDefaults.standard.set(token, forKey: "apns_token")
   }
   ```

   ```objc
   // Objective-C
   - (void)application:(UIApplication *)application 
   didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
     NSString *token = [[deviceToken description] stringByTrimmingCharactersInSet:
                        [NSCharacterSet characterSetWithCharactersInString:@"<>"]];
     token = [token stringByReplacingOccurrencesOfString:@" " withString:@""];
     [[NSUserDefaults standardUserDefaults] setObject:token forKey:@"apns_token"];
   }
   ```

### Android Setup

1. **Add Firebase to your project**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Add your Android app to the project
   - Download `google-services.json` and place it in `android/app/`

2. **Update `android/build.gradle`**:
   ```gradle
   buildscript {
     dependencies {
       classpath 'com.google.gms:google-services:4.3.15'
     }
   }
   ```

3. **Update `android/app/build.gradle`**:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   
   dependencies {
     implementation platform('com.google.firebase:firebase-bom:32.0.0')
     implementation 'com.google.firebase:firebase-messaging'
   }
   ```

4. **Update `AndroidManifest.xml`** (usually in `android/app/src/main/AndroidManifest.xml`):
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
   ```

## Quick Start

### 1. Setup (One Line!)

```typescript
import NotificationAPI from 'notificationapi-react-native-sdk';

// That's it! This handles initialization, user identification, and permission requests
await NotificationAPI.setup({
  clientId: 'your_client_id_here',
  userId: 'user123',
  autoRequestPermission: true, // automatically request push permissions
  region: 'us', // 'us' (default), 'eu', or 'ca'
});
```

### 2. Listen to Notifications (Optional)

```typescript
import { getEventEmitter, Events } from 'notificationapi-react-native-sdk';

const eventEmitter = getEventEmitter();

// Listen to notifications received while app is open
eventEmitter.addListener(Events.NOTIFICATION_RECEIVED, (notification) => {
  console.log('Received notification:', notification.title);
});

// Listen to notifications that opened the app
eventEmitter.addListener(Events.NOTIFICATION_ON_CLICK, (notification) => {
  console.log('App opened from notification:', notification.title);
  // Handle deep linking or navigation
});

// Listen to push token updates
eventEmitter.addListener(Events.PUSH_TOKEN_RECEIVED, (event) => {
  console.log('Push token received:', event.token);
});
```

### 3. Check Status

```typescript
// Check if SDK is ready
if (NotificationAPI.isReady) {
  console.log('NotificationAPI is ready!');
}

// Get the current user
const userId = NotificationAPI.currentUser;

// Get push token
const token = await NotificationAPI.getPushToken();
```

## Complete Example

```typescript
import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import NotificationAPI, { getEventEmitter, Events } from 'notificationapi-react-native-sdk';

function App() {
  useEffect(() => {
    // Setup NotificationAPI
    NotificationAPI.setup({
      clientId: 'your_client_id',
      userId: 'user123',
      autoRequestPermission: true,
    }).catch((error) => {
      console.error('Failed to setup NotificationAPI:', error);
    });

    // Listen for notifications
    const eventEmitter = getEventEmitter();
    
    const receivedListener = eventEmitter.addListener(
      Events.NOTIFICATION_RECEIVED,
      (notification) => {
        Alert.alert('New Notification', notification.title);
      }
    );

    const clickListener = eventEmitter.addListener(
      Events.NOTIFICATION_ON_CLICK,
      (notification) => {
        Alert.alert('Notification Clicked', notification.title);
        // Handle navigation or deep linking
      }
    );

    return () => {
      receivedListener.remove();
      clickListener.remove();
    };
  }, []);

  const handleRequestPermission = async () => {
    const granted = await NotificationAPI.requestPermission();
    Alert.alert(
      'Permission',
      granted ? 'Permission granted' : 'Permission denied'
    );
  };

  return (
    <View>
      <Button
        title="Request Permission"
        onPress={handleRequestPermission}
      />
    </View>
  );
}

export default App;
```

## API Reference

### NotificationAPI.setup(options)

Initialize the SDK with user credentials.

**Parameters:**
- `clientId` (string, required): Your NotificationAPI client ID
- `userId` (string, required): The user's unique identifier
- `hashedUserId` (string, optional): Hashed user ID for privacy
- `region` (string, optional): Region code - 'us' (default), 'eu', or 'ca'
- `autoRequestPermission` (boolean, optional): Automatically request push permission (default: true)
- `baseUrl` (string, optional): Custom base URL (overrides region)

**Returns:** `Promise<void>`

### NotificationAPI.requestPermission()

Request push notification permission.

**Returns:** `Promise<boolean>` - true if permission was granted

### NotificationAPI.getPushToken()

Get the current push token (FCM on Android, APN on iOS).

**Returns:** `Promise<string | null>`

### NotificationAPI.getDeviceInfo()

Get device information.

**Returns:** `Promise<Device>` - Device object with device_id, platform, manufacturer, model, etc.

### NotificationAPI.getService()

Get the API service instance for advanced usage (in-app notifications, preferences, etc.).

**Returns:** `NotificationAPIService`

### Properties

- `NotificationAPI.isReady` (boolean): Check if SDK is initialized
- `NotificationAPI.currentUser` (string | null): Get current user ID

## Events

### Events.NOTIFICATION_PERMISSIONS_REQUESTED

Emitted when notification permission is requested.

**Event data:**
```typescript
{
  isGranted: boolean;
}
```

### Events.NOTIFICATION_ON_CLICK

Emitted when a notification is clicked/tapped.

**Event data:**
```typescript
{
  messageId: string;
  senderId: string;
  ttl: number;
  title: string;
  body: string;
  data: Record<string, unknown>;
}
```

### Events.PUSH_TOKEN_RECEIVED

Emitted when a push token is received.

**Event data:**
```typescript
{
  token: string;
  type: 'FCM' | 'APN';
}
```

### Events.NOTIFICATION_RECEIVED

Emitted when a notification is received (foreground).

**Event data:**
```typescript
{
  messageId: string;
  senderId: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}
```

## Advanced Usage

### In-App Notifications

The SDK also supports in-app notifications (similar to the React Client SDK):

```typescript
const service = NotificationAPI.getService();

// Get in-app notifications
const result = await service.getInAppNotifications({
  before: new Date().toISOString(),
  maxCount: 100,
});

// Mark as opened
await service.updateInAppNotifications({
  ids: ['notification-id'],
  opened: true,
});

// Mark as clicked
await service.updateInAppNotifications({
  ids: ['notification-id'],
  clicked: true,
});

// Get preferences
const preferences = await service.getPreferences();
```

## Platform-Specific Notes

### Android

- Requires Firebase Cloud Messaging (FCM) setup
- Background notifications are handled automatically
- Foreground notifications can be customized via event listeners

### iOS

- Uses native APN (Apple Push Notifications)
- Requires Apple Developer Program membership
- Push Notifications capability must be enabled in Xcode
- APN keys must be configured in NotificationAPI dashboard
- Environment (sandbox/production) is determined by your build configuration

## Troubleshooting

### Push tokens not syncing

- **Android**: Verify Firebase is properly configured and `google-services.json` is in the correct location
- **iOS**: Ensure APN is properly configured and the app has push notification capabilities enabled
- Check that `NotificationAPI.setup()` completed successfully

### Notifications not received

- Verify permission was granted: `await NotificationAPI.requestPermission()`
- Check that your NotificationAPI client ID is correct
- Ensure push tokens are being synced (check `getPushToken()`)
- **Android**: Verify Firebase project includes your app's package name
- **iOS**: Ensure APN keys are correctly configured

### Permission denied

- **Android**: Check app notification settings in device settings
- **iOS**: Check notification settings in iOS Settings app
- Try calling `requestPermission()` again

## Testing Locally

See [TESTING.md](./TESTING.md) for a comprehensive guide on testing the SDK locally in a React Native app.

Quick start:
```bash
# In SDK directory
npm link

# In your test app
npm link notificationapi-react-native-sdk
```

## Support

- [Documentation](https://docs.notificationapi.com)
- [GitHub Issues](https://github.com/notificationapi-com/notificationapi-react-native-sdk/issues)
- [Email Support](mailto:support@notificationapi.com)

## License

MIT

