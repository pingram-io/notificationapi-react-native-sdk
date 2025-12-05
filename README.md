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
npm install notificationapi-react-native-sdk
# or
yarn add notificationapi-react-native-sdk
```

### 2. Setup (One Line!)

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

### 3. Listen to Notifications (Optional)

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

| Method | Description | Returns |
|--------|-------------|---------|
| `setup(options)` | One-call setup with initialization, identification, and optional permission request | `Promise<void>` |
| `requestPermission()` | Request push notification permission | `Promise<boolean>` |
| `getPushToken()` | Get the current push token (FCM on Android, APN on iOS) | `Promise<string \| null>` |
| `getDeviceInfo()` | Get device information | `Promise<Device>` |
| `getService()` | Get the API service instance for advanced usage | `NotificationAPIService` |

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

## 🐛 Troubleshooting

### Common Issues

1. **Notifications not received**

   - **Android**: Verify Firebase setup is correct
   - **iOS**: Ensure APN key is configured correctly
   - Check if permission was granted: `await NotificationAPI.requestPermission()`
   - Ensure your NotificationAPI client ID is correct

2. **Push tokens not syncing**

   - **Android**: Verify Firebase is properly configured and `google-services.json` is in the correct location
   - **iOS**: Ensure APN is properly configured and the app has push notification capabilities enabled
   - Check that `NotificationAPI.setup()` completed successfully

3. **ClassNotFoundException for FirebaseMessagingService**

   - Ensure the service file is in your app's package directory
   - Verify the package name in the service file matches your app's package
   - Check that the service is registered in `AndroidManifest.xml` with the correct package path
   - Clean and rebuild: `cd android && ./gradlew clean && cd .. && npx react-native run-android`

4. **Permission denied**

   - **Android**: Check app notification settings in device settings
   - **iOS**: Check notification settings in iOS Settings app
   - Try calling `requestPermission()` again

5. **Android Specific Issues**
   - Verify `google-services.json` is in the correct location
   - Check that Firebase project includes your Android app's package name
   - Ensure `FirebaseMessagingService` is created in your app's package (Step 4)
   - Check that the service is registered in `AndroidManifest.xml`
   - Check logs: `adb logcat | grep NotificationAPI`

6. **iOS Specific Issues**
   - Ensure you have an Apple Developer Program membership
   - Push Notifications capability must be enabled in Xcode
   - APNs keys must be properly configured on your server

## Testing Locally

See [TESTING.md](./TESTING.md) for a comprehensive guide on testing the SDK locally in a React Native app.

Quick start:
```bash
# In SDK directory
npm link

# In your test app
npm link notificationapi-react-native-sdk
```

## 📞 Support

- [Documentation](https://notificationapi.com/docs)
- [Email Support](mailto:support@notificationapi.com)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
