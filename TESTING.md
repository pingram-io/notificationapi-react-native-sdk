# Testing the React Native SDK Locally

This guide will help you test the NotificationAPI React Native SDK in a local React Native app.

## Prerequisites

1. **React Native development environment** set up:
   - Node.js (v16 or higher)
   - React Native CLI or Expo
   - Android Studio (for Android testing)
   - Xcode (for iOS testing, macOS only)

2. **NotificationAPI account**:
   - A NotificationAPI account with a client ID
   - Test user ID

3. **Platform-specific setup**:
   - **Android**: Firebase project configured
   - **iOS**: Apple Developer account with APN configured

## Method 1: Using npm/yarn link (Recommended)

### Step 1: Link the SDK package

In the SDK directory:

```bash
cd notificationapi-react-native-sdk
npm link
# or
yarn link
```

### Step 2: Create a test React Native app

```bash
# Create a new React Native app (if you don't have one)
npx react-native init NotificationAPITestApp

cd NotificationAPITestApp
```

### Step 3: Link the SDK in your test app

```bash
# Link the local package
npm link notificationapi-react-native-sdk
# or
yarn link notificationapi-react-native-sdk

# Install dependencies
npm install
# or
yarn install
```

### Step 4: Install peer dependencies

Make sure React Native is installed:

```bash
npm install react react-native
```

### Step 5: Update your test app code

Create or update `App.tsx`:

```typescript
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  Text,
  Button,
  View,
  StyleSheet,
  Alert,
} from 'react-native';
import NotificationAPI, { getEventEmitter, Events } from 'notificationapi-react-native-sdk';

function App(): React.JSX.Element {
  const [status, setStatus] = useState('Not initialized');
  const [token, setToken] = useState<string | null>(null);
  const [lastNotification, setLastNotification] = useState<string>('None');

  useEffect(() => {
    // Setup NotificationAPI
    const setupSDK = async () => {
      try {
        setStatus('Initializing...');
        await NotificationAPI.setup({
          clientId: 'YOUR_CLIENT_ID_HERE', // Replace with your client ID
          userId: 'test-user-123', // Replace with test user ID
          autoRequestPermission: true,
          region: 'us',
        });
        setStatus('Initialized successfully');
        
        // Get push token
        const pushToken = await NotificationAPI.getPushToken();
        setToken(pushToken);
        console.log('Push token:', pushToken);
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        console.error('Setup error:', error);
      }
    };

    setupSDK();

    // Listen to events
    const eventEmitter = getEventEmitter();

    const permissionListener = eventEmitter.addListener(
      Events.NOTIFICATION_PERMISSIONS_REQUESTED,
      (event) => {
        Alert.alert('Permission', `Permission ${event.isGranted ? 'granted' : 'denied'}`);
      }
    );

    const receivedListener = eventEmitter.addListener(
      Events.NOTIFICATION_RECEIVED,
      (notification) => {
        setLastNotification(`Received: ${notification.title}`);
        Alert.alert('Notification Received', notification.title);
      }
    );

    const clickListener = eventEmitter.addListener(
      Events.NOTIFICATION_ON_CLICK,
      (notification) => {
        setLastNotification(`Clicked: ${notification.title}`);
        Alert.alert('Notification Clicked', notification.title);
      }
    );

    const tokenListener = eventEmitter.addListener(
      Events.PUSH_TOKEN_RECEIVED,
      (event) => {
        setToken(event.token);
        Alert.alert('Token Received', `Token: ${event.token.substring(0, 20)}...`);
      }
    );

    return () => {
      permissionListener.remove();
      receivedListener.remove();
      clickListener.remove();
      tokenListener.remove();
    };
  }, []);

  const handleRequestPermission = async () => {
    try {
      const granted = await NotificationAPI.requestPermission();
      Alert.alert('Permission', granted ? 'Granted' : 'Denied');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleGetToken = async () => {
    try {
      const pushToken = await NotificationAPI.getPushToken();
      setToken(pushToken);
      Alert.alert('Push Token', pushToken || 'No token available');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleGetDeviceInfo = async () => {
    try {
      const deviceInfo = await NotificationAPI.getDeviceInfo();
      Alert.alert('Device Info', JSON.stringify(deviceInfo, null, 2));
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentInsetAdjustmentBehavior="automatic">
        <View style={styles.section}>
          <Text style={styles.title}>NotificationAPI SDK Test</Text>
          
          <View style={styles.statusContainer}>
            <Text style={styles.label}>Status:</Text>
            <Text style={styles.value}>{status}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.label}>Ready:</Text>
            <Text style={styles.value}>{NotificationAPI.isReady ? 'Yes' : 'No'}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.label}>User:</Text>
            <Text style={styles.value}>{NotificationAPI.currentUser || 'None'}</Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.label}>Push Token:</Text>
            <Text style={styles.tokenValue} numberOfLines={2}>
              {token ? `${token.substring(0, 30)}...` : 'Not available'}
            </Text>
          </View>

          <View style={styles.statusContainer}>
            <Text style={styles.label}>Last Notification:</Text>
            <Text style={styles.value}>{lastNotification}</Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Request Permission"
              onPress={handleRequestPermission}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Get Push Token"
              onPress={handleGetToken}
            />
          </View>

          <View style={styles.buttonContainer}>
            <Button
              title="Get Device Info"
              onPress={handleGetDeviceInfo}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statusContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 5,
  },
  value: {
    fontSize: 16,
    color: '#000',
  },
  tokenValue: {
    fontSize: 12,
    color: '#000',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 10,
  },
});

export default App;
```

### Step 6: Android Setup

1. **Add Firebase** (if not already done):
   - Create Firebase project
   - Add Android app
   - Download `google-services.json`
   - Place in `android/app/`

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
   ```

4. **Run on Android**:
   ```bash
   npx react-native run-android
   ```

### Step 7: iOS Setup

1. **Install pods**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

2. **Update AppDelegate** (if needed):
   Add to `ios/YourApp/AppDelegate.m` or `AppDelegate.swift`:
   
   **Objective-C:**
   ```objc
   - (void)application:(UIApplication *)application 
   didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
     NSString *token = [[deviceToken description] stringByTrimmingCharactersInSet:
                        [NSCharacterSet characterSetWithCharactersInString:@"<>"]];
     token = [token stringByReplacingOccurrencesOfString:@" " withString:@""];
     [[NSUserDefaults standardUserDefaults] setObject:token forKey:@"apns_token"];
   }
   ```
   
   **Swift:**
   ```swift
   func application(_ application: UIApplication, 
                    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
     let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
     UserDefaults.standard.set(token, forKey: "apns_token")
   }
   ```

3. **Enable Push Notifications** in Xcode:
   - Open `ios/YourApp.xcworkspace`
   - Select target → Signing & Capabilities
   - Add "Push Notifications"

4. **Run on iOS**:
   ```bash
   npx react-native run-ios
   ```

## Method 2: Using file path (Alternative)

If `npm link` doesn't work, you can use a file path directly:

```json
// In your test app's package.json
{
  "dependencies": {
    "notificationapi-react-native-sdk": "file:../notificationapi-react-native-sdk"
  }
}
```

Then run:
```bash
npm install
```

## Testing Checklist

### Basic Functionality

- [ ] SDK initializes without errors
- [ ] `setup()` completes successfully
- [ ] `isReady` returns `true` after setup
- [ ] `currentUser` returns the correct user ID

### Push Tokens

- [ ] `getPushToken()` returns a valid token
- [ ] Token is synced to NotificationAPI backend (check logs/network)
- [ ] `PUSH_TOKEN_RECEIVED` event is emitted

### Permissions

- [ ] `requestPermission()` shows permission dialog
- [ ] Permission result is correct (granted/denied)
- [ ] `NOTIFICATION_PERMISSIONS_REQUESTED` event is emitted

### Device Info

- [ ] `getDeviceInfo()` returns correct device information
- [ ] Device ID is present
- [ ] Platform, manufacturer, model are correct

### Notifications

- [ ] Send test notification from NotificationAPI dashboard
- [ ] Notification is received when app is in foreground
- [ ] `NOTIFICATION_RECEIVED` event is emitted
- [ ] Notification is received when app is in background
- [ ] Tapping notification opens app
- [ ] `NOTIFICATION_ON_CLICK` event is emitted

## Debugging

### Check Logs

**Android:**
```bash
npx react-native log-android
```

**iOS:**
```bash
npx react-native log-ios
```

### Common Issues

1. **"Native module not found"**
   - Make sure you've run `pod install` (iOS)
   - Rebuild the app: `npx react-native run-android` or `run-ios`
   - Clear build: `cd android && ./gradlew clean` or `cd ios && rm -rf build`

2. **"Push token not available"**
   - **Android**: Check Firebase setup, verify `google-services.json` is in correct location
   - **iOS**: Check APN configuration, ensure Push Notifications capability is enabled

3. **"Permission denied"**
   - Check device notification settings
   - Try uninstalling and reinstalling the app
   - For Android 13+, ensure `POST_NOTIFICATIONS` permission is in manifest

4. **"API request failed"**
   - Verify client ID and user ID are correct
   - Check network connectivity
   - Verify region is correct (us/eu/ca)

### Testing API Calls

You can test the service layer directly:

```typescript
const service = NotificationAPI.getService();

// Test getting preferences
try {
  const preferences = await service.getPreferences();
  console.log('Preferences:', preferences);
} catch (error) {
  console.error('Error getting preferences:', error);
}

// Test getting in-app notifications
try {
  const notifications = await service.getInAppNotifications({
    before: new Date().toISOString(),
    maxCount: 10,
  });
  console.log('Notifications:', notifications);
} catch (error) {
  console.error('Error getting notifications:', error);
}
```

## Sending Test Notifications

1. **Via NotificationAPI Dashboard**:
   - Log into your NotificationAPI account
   - Go to "Send Notification"
   - Select your test user ID
   - Choose "PUSH" channel
   - Send notification

2. **Via API** (using Node.js SDK or curl):
   ```bash
   curl -X POST https://api.notificationapi.com/YOUR_CLIENT_ID/send \
     -H "Authorization: Basic YOUR_AUTH_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "notificationId": "test_notification",
       "user": {
         "id": "test-user-123"
       }
     }'
   ```

## Next Steps

Once basic functionality is working:

1. Test with different regions (us, eu, ca)
2. Test with hashed user IDs
3. Test token refresh scenarios
4. Test notification handling in different app states (foreground, background, terminated)
5. Test deep linking from notifications
6. Test in-app notifications (if using that feature)

