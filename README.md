# NotificationAPI React Native SDK

A React Native SDK for integrating [NotificationAPI](https://notificationapi.com) push notifications into your mobile app.

## Features

- **Cross-platform push notifications**: Full support for Android (FCM) and iOS (APN)
- **One-call setup**: Simple `setup()` method handles initialization, user identification, and permission requests
- **Automatic token syncing**: Push tokens are automatically synced with NotificationAPI backend
- **Event handling**: Listen to notification received and opened events
- **Device information**: Automatic device information collection
- **Region support**: Support for US, EU, and CA regions

## Requirements

- **React Native**: >= 0.73.0
- **React**: >= 18.0.0
- **New Architecture**: Required (enabled by default in React Native 0.73+)

> **Note**: This SDK uses TurboModule (React Native's New Architecture), which requires React Native 0.73.0 or higher. If you're using React Native 0.68-0.72, you'll need to enable the New Architecture manually.

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

The setup process is as follows:

1. [Set up a Firebase Project](#1-set-up-a-firebase-project)
2. [Connect NotificationAPI to FCM](#2-connect-notificationapi-to-fcm)
3. [Configure your React Native project for Firebase](#3-configure-your-react-native-project-for-firebase)
4. [Add FirebaseMessagingService](#4-add-firebasemessagingservice)
5. [Install and initialize the NotificationAPI React Native SDK](#5-install-and-initialize-the-notificationapi-react-native-sdk)

---

#### 1. Set up a Firebase Project

If you don't have one already, you'll need to create a Firebase project.

1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2. Within your new project, navigate to **Project Settings** > **General**.
3. Click the Android icon to add an Android app to your project. Use your React Native app's package name (e.g., `com.example.myapp`).
   - Find your package name in `android/app/build.gradle` under `applicationId`
4. Follow the on-screen instructions to register the app, and download the `google-services.json` file.
5. Place the downloaded `google-services.json` file into the `android/app/` directory of your React Native project.

---

#### 2. Connect NotificationAPI to FCM

To allow NotificationAPI to send notifications on your behalf, you need to provide it with your Firebase project's credentials.

1. In the Firebase Console, go to **Project Settings** > **Service Accounts**.
2. Click **Generate new private key**. A JSON file containing your service account key will be downloaded.

<details>
<summary><strong>⚠️ Important</strong></summary>

Treat this file like a password. Never commit it to version control or expose it in your client-side application.

</details>

3. Go to your [NotificationAPI Dashboard](https://app.notificationapi.com/) and navigate to the **Integrations** page.
4. Find the **Firebase Cloud Messaging (FCM)** integration and click **Configure**.
5. Upload the service account JSON file you downloaded from Firebase.

Your NotificationAPI account is now connected to your Firebase project.

---

#### 3. Configure your React Native project for Firebase

Next, you need to add the Google Services plugin to your React Native project's Android configuration.

**In `android/build.gradle`:**

Add the google-services plugin to the `buildscript` dependencies.

```gradle
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        // ...
        classpath 'com.google.gms:google-services:4.4.2'
    }
}
```

**In `android/app/build.gradle`:**

Apply the `com.google.gms.google-services` plugin at the top of the file.

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services'

// ...

dependencies {
    // ...
    implementation platform('com.google.firebase:firebase-bom:33.0.0')
    implementation 'com.google.firebase:firebase-messaging'
}
```

**In `android/app/src/main/AndroidManifest.xml`:**

Add the required permissions and register the FirebaseMessagingService:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  
  <uses-permission android:name="android.permission.INTERNET" />
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
  
  <application ...>
    <!-- Your existing activities -->
    
    <!-- Register FirebaseMessagingService -->
    <service
      android:name=".NotificationApiFirebaseMessagingService"
      android:exported="false">
      <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
      </intent-filter>
    </service>
  </application>
</manifest>
```

**Note**: Replace `.NotificationApiFirebaseMessagingService` with your actual package path (e.g., `com.example.myapp.NotificationApiFirebaseMessagingService`)

Now, build your app to ensure the Firebase configuration is correct:

```bash
npx react-native run-android
```

---

#### 4. Add FirebaseMessagingService

Due to Android's class loading requirements, you need to create a `FirebaseMessagingService` in your app's package. This is a one-time setup.

Create a new file: `android/app/src/main/java/com/yourapp/package/NotificationApiFirebaseMessagingService.kt`

**Replace `com.yourapp.package` with your app's actual package name** (same as your `applicationId` in `build.gradle`).

Copy and paste this code:

```kotlin
package com.yourapp.package  // Replace with your app's package name

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class NotificationApiFirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        // Show the notification
        showNotification(remoteMessage)
        
        // Emit event to React Native
        sendNotificationReceivedEvent(remoteMessage)
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        // Token refresh is handled by the SDK's sync mechanism
    }
    
    private fun showNotification(remoteMessage: RemoteMessage) {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "notificationapi_channel",
                "NotificationAPI",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "NotificationAPI push notifications"
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
        }
        
        // Extract title and body
        val title = remoteMessage.data["title"] ?: remoteMessage.notification?.title ?: "Notification"
        val body = remoteMessage.data["body"] ?: remoteMessage.notification?.body ?: ""
        
        // Create intent for when notification is clicked
        val intent = Intent(this, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            remoteMessage.data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        // Get app icon
        val iconResId = try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            appInfo.icon
        } catch (e: Exception) {
            android.R.drawable.ic_dialog_info
        }
        
        // Build and show notification
        val notificationBuilder = NotificationCompat.Builder(this, "notificationapi_channel")
            .setSmallIcon(iconResId)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
        
        val notificationId = remoteMessage.messageId?.hashCode() ?: System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
    }
    
    private fun sendNotificationReceivedEvent(remoteMessage: RemoteMessage) {
        try {
            // Get React context from SDK module
            val moduleClass = Class.forName("com.notificationapi.rn.NotificationApiModule")
            val getReactContextMethod = moduleClass.getMethod("getReactContext")
            val reactContext = getReactContextMethod.invoke(null) as? com.facebook.react.bridge.ReactApplicationContext
            
            reactContext?.let { context ->
                val params = Arguments.createMap().apply {
                    putString("messageId", remoteMessage.messageId)
                    putString("senderId", remoteMessage.from)
                    putString("title", remoteMessage.data["title"] ?: remoteMessage.notification?.title ?: "")
                    putString("body", remoteMessage.data["body"] ?: remoteMessage.notification?.body ?: "")
                    
                    val dataMap = Arguments.createMap()
                    remoteMessage.data.forEach { (key, value) ->
                        dataMap.putString(key, value)
                    }
                    putMap("data", dataMap)
                }
                
                context
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    ?.emit("notificationapi_notification_received", params)
            }
        } catch (e: Exception) {
            // React context not available yet
        }
    }
}
```

**Important**: 
- Replace `com.yourapp.package` with your actual app package name (found in `android/app/build.gradle` as `applicationId`)
- Replace `MainActivity` with your main activity class name if different

That's it! The service will automatically handle incoming notifications and display them.

---

#### 5. Install and initialize the NotificationAPI React Native SDK

Our React Native SDK makes it easy to register the device for push notifications.

**Install the SDK:**

```bash
npm install notificationapi-react-native-sdk
# or
yarn add notificationapi-react-native-sdk
```

**Then, initialize the SDK in your app** (e.g., in `App.tsx` or your main component):

```typescript
import NotificationAPI from 'notificationapi-react-native-sdk';

// Initialize when your app starts
await NotificationAPI.setup({
  clientId: 'YOUR_CLIENT_ID', // from NotificationAPI dashboard
  userId: 'user123', // your app's user ID
  autoRequestPermission: true, // automatically request push permissions
  region: 'us', // 'us' (default), 'eu', or 'ca'
});
```

This will automatically handle requesting push permissions and registering the device token with NotificationAPI.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `clientId`* | `string` | Your NotificationAPI account clientId. You can get it from [here](https://app.notificationapi.com/). |
| `userId`* | `string` | The unique ID of the user in your application. |
| `hashedUserId` | `string` | Hashed user ID for privacy (optional). |
| `region` | `string` | Region code: `'us'` (default), `'eu'`, or `'ca'`. |
| `autoRequestPermission` | `boolean` | Automatically request push notification permission (default: `true`). |

---

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
- **Android**: 
  - Verify Firebase project includes your app's package name
  - Ensure `FirebaseMessagingService` is created in your app's package (Step 4)
  - Check that the service is registered in `AndroidManifest.xml`
  - Check logs: `adb logcat | grep NotificationAPI`
- **iOS**: Ensure APN keys are correctly configured

### ClassNotFoundException for FirebaseMessagingService

- Ensure the service file is in your app's package directory
- Verify the package name in the service file matches your app's package
- Check that the service is registered in `AndroidManifest.xml` with the correct package path
- Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

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

