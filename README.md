# NotificationAPI React Native SDK

A React Native SDK for integrating [NotificationAPI](https://notificationapi.com) push notifications into your mobile app.

## 🚀 Push Notification Support

**Cross-platform push notifications with native performance:**

- **Android**: Full FCM (Firebase Cloud Messaging) support
- **iOS**: Direct APN (Apple Push Notifications) integration

This means you get native push notifications on both platforms with optimal performance.

## 🚀 Quick Start

### 1. Installation

```bash
npm install @notificationapi/react-native
# or
yarn add @notificationapi/react-native
```

### 2. Setup (One Line!)

```typescript
import NotificationAPI from '@notificationapi/react-native';

// That's it! This handles initialization, user identification, and permission requests
await NotificationAPI.setup({
  clientId: 'your_client_id_here',
  userId: 'user123',
  autoRequestPermission: true, // automatically request push permissions
  region: 'us' // 'us' (default), 'eu', or 'ca'
});
```

### 3. Listen to Notifications (Optional)

```typescript
import { getEventEmitter, Events } from '@notificationapi/react-native';

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

### 4. Check Status

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

## 📱 Complete Example

```typescript
import React, { useEffect } from 'react';
import { View, Button, Alert } from 'react-native';
import NotificationAPI, { getEventEmitter, Events } from '@notificationapi/react-native';

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

## 🌙 Background Notifications (App Closed)

Background notifications are automatically handled by the native modules. The SDK uses:

- **FCM** for Android background notifications
- **APN** for iOS background notifications

No additional setup is required for basic background notification handling.

### Handling Notification Taps

When users tap a notification while the app is terminated, it's automatically handled:

```typescript
const eventEmitter = getEventEmitter();

eventEmitter.addListener(Events.NOTIFICATION_ON_CLICK, (notification) => {
  console.log('Notification tapped:', notification.title);

  // Handle deep linking or navigation
  if (notification.data?.deepLink) {
    // Navigate to specific screen
    navigation.navigate(notification.data.deepLink);
  }
});
```

## 🔧 API Reference

### NotificationAPI

| Method                | Description                                                                         | Returns                   |
| --------------------- | ----------------------------------------------------------------------------------- | ------------------------- |
| `setup(options)`      | One-call setup with initialization, identification, and optional permission request | `Promise<void>`           |
| `requestPermission()` | Request push notification permission                                                | `Promise<boolean>`        |
| `getPushToken()`      | Get the current push token (FCM on Android, APN on iOS)                             | `Promise<string \| null>` |
| `getDeviceInfo()`     | Get device information                                                              | `Promise<Device>`         |
| `getService()`        | Get the API service instance for advanced usage                                     | `NotificationAPIService`  |

### Setup Parameters

```typescript
await NotificationAPI.setup({
  clientId: string,                  // Your NotificationAPI client ID (required)
  userId: string,                    // User's unique identifier (required)
  hashedUserId?: string,             // Hashed user ID for privacy (optional)
  region?: string,                   // 'us' (default), 'eu', or 'ca'
  autoRequestPermission?: boolean,  // Auto-request push permission (default: true)
  baseUrl?: string,                  // Custom base URL (overrides region)
});
```

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

## 🔒 Privacy & Security

- User IDs can be hashed for additional privacy
- All communication uses HTTPS
- Push tokens are securely stored in NotificationAPI backend

## 🛠️ Platform Setup

### Requirements

- **React Native**: >= 0.73.0
- **React**: >= 18.0.0
- **New Architecture**: Required (enabled by default in React Native 0.73+)

> **Note**: This SDK uses TurboModule (React Native's New Architecture), which requires React Native 0.73.0 or higher. If you're using React Native 0.68-0.72, you'll need to enable the New Architecture manually.

### Android (Firebase Required)

The setup process is as follows:

1. [Set up Firebase](#1-set-up-firebase)
2. [Connect NotificationAPI to FCM](#2-connect-notificationapi-to-fcm)
3. [Install and initialize the NotificationAPI React Native SDK](#3-install-and-initialize-the-notificationapi-react-native-sdk)

---

#### 1. Set up Firebase

If you haven't already set up Firebase for your React Native Android app, follow Google's official documentation:

- [Add Firebase to your Android project](https://firebase.google.com/docs/android/setup)

This will guide you through:
- Creating a Firebase project (if needed)
- Adding your Android app to the project
- Downloading and placing the `google-services.json` file in `android/app/`
- Adding the Google Services plugin to your `build.gradle` files

> **Note:** Firebase dependencies (`firebase-messaging`) are automatically included when you install the NotificationAPI React Native SDK. You don't need to manually add Firebase dependencies to your `build.gradle` files.

> **Note:** Permissions (`INTERNET` and `POST_NOTIFICATIONS`) and the `FirebaseMessagingService` registration are automatically handled by the SDK via Android's manifest merger. You don't need to manually add these to your `AndroidManifest.xml`.

---

#### 2. Connect NotificationAPI to FCM

To allow NotificationAPI to send notifications on your behalf, you need to provide it with your Firebase project's credentials.

1. In the [Firebase Console](https://console.firebase.google.com/), go to **Project Settings** > **Service Accounts**.
2. Click **Generate new private key**. A JSON file containing your service account key will be downloaded.

<details>
<summary><strong>⚠️ Important</strong></summary>

Treat this file like a password. Never commit it to version control or expose it in your client-side application.

</details>

3. Go to your [NotificationAPI Dashboard](https://app.notificationapi.com/) and navigate to **Settings** > **Push**.
4. Find the **Android (FCM)** form and copy the contents of the JSON file (including the `{}`) into the field and save.

Your NotificationAPI account is now connected to your Firebase project.

---

#### 3. Install and initialize the NotificationAPI React Native SDK

Our React Native SDK makes it easy to register the device for push notifications.

**Install the SDK:**

```bash
npm install @notificationapi/react-native
# or
yarn add @notificationapi/react-native
```

**Then, initialize the SDK in your app** (e.g., in `App.tsx` or your main component):

```typescript
import NotificationAPI from '@notificationapi/react-native';

// Initialize when your app starts
await NotificationAPI.setup({
  clientId: 'YOUR_CLIENT_ID', // from NotificationAPI dashboard
  userId: 'user123', // your app's user ID
  autoRequestPermission: true, // automatically request push permissions
  region: 'us' // 'us' (default), 'eu', or 'ca'
});
```

This will automatically handle requesting push permissions and registering the device token with NotificationAPI.

### iOS (No Firebase Required!)

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
   - **Important**: When uploading the APN key to NotificationAPI, ensure it includes the PEM headers:
     ```
     -----BEGIN PRIVATE KEY-----
     [your key content here]
     -----END PRIVATE KEY-----
     ```
   - Configure your NotificationAPI account with the APN key

4. **Update AppDelegate** (if needed):
   The SDK handles most of the setup, but you may need to ensure your `AppDelegate.m` or `AppDelegate.swift` properly handles APN token registration:

   ```swift
   // Swift
   import UserNotifications

   func application(_ application: UIApplication,
                    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
     let token = deviceToken.map { String(format: "%02x", $0) }.joined()
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

## 📞 Support

- [Documentation](https://notificationapi.com/docs)
- [Email Support](mailto:support@notificationapi.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
