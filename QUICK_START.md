# Quick Start Guide - Testing the SDK

## Prerequisites Checklist

### For iOS Testing (Physical iPhone)

✅ **Required:**
- macOS computer (Xcode only works on Mac)
- Xcode installed (free from App Store)
- iPhone connected via USB
- Apple ID (free account works for development)
- React Native CLI installed: `npm install -g react-native-cli`

✅ **Optional but Recommended:**
- CocoaPods: `sudo gem install cocoapods`
- Node.js and npm/yarn

### For Android Testing (Easier to Start)

✅ **Required:**
- Any OS (Windows, macOS, Linux)
- Android Studio installed
- Android emulator OR physical Android device
- React Native CLI

## Easiest Path: Start with Android

Android is easier to test because:
- Works on any OS (not just macOS)
- No Apple Developer account needed
- Emulator works without physical device
- Faster initial setup

### Step 1: Create Test App

```bash
npx react-native init NotificationAPITestApp
cd NotificationAPITestApp
```

### Step 2: Link SDK

```bash
# From SDK directory
cd ../notificationapi-react-native-sdk
npm link

# Back to test app
cd ../NotificationAPITestApp
npm link notificationapi-react-native-sdk
npm install
```

### Step 3: Add Test Code

Copy the test code from `TESTING.md` into `App.tsx`

### Step 4: Run on Android

```bash
# Start Android emulator from Android Studio first, then:
npx react-native run-android
```

## For iOS Testing (macOS + iPhone)

### Step 1: Same as Android (create app, link SDK)

### Step 2: iOS-Specific Setup

1. **Install CocoaPods** (if not installed):
   ```bash
   sudo gem install cocoapods
   ```

2. **Install iOS dependencies**:
   ```bash
   cd ios
   pod install
   cd ..
   ```

3. **Open in Xcode**:
   ```bash
   open ios/NotificationAPITestApp.xcworkspace
   ```
   ⚠️ Important: Open `.xcworkspace`, NOT `.xcodeproj`

4. **Configure Signing**:
   - In Xcode, select your project in the left sidebar
   - Select the target
   - Go to "Signing & Capabilities"
   - Check "Automatically manage signing"
   - Select your Team (your Apple ID)

5. **Enable Push Notifications**:
   - Still in "Signing & Capabilities"
   - Click "+ Capability"
   - Add "Push Notifications"

6. **Update AppDelegate** (for APN token):
   - Open `ios/NotificationAPITestApp/AppDelegate.m` (or `.swift`)
   - Add the token handling code (see TESTING.md)

7. **Connect iPhone**:
   - Connect via USB
   - Trust the computer on iPhone if prompted
   - In Xcode, select your iPhone from the device dropdown (top toolbar)

8. **Run**:
   ```bash
   npx react-native run-ios --device
   ```
   Or click the Play button in Xcode

### Step 3: Trust Developer on iPhone

First time running:
- On iPhone: Settings → General → VPN & Device Management
- Trust your developer certificate
- App will launch

## Testing Checklist

### Minimum to Test SDK Works:

1. ✅ App builds and runs
2. ✅ SDK initializes (check console logs)
3. ✅ `isReady` returns `true`
4. ✅ Push token is retrieved
5. ✅ Permission can be requested

### Full Testing:

6. ✅ Send test notification from NotificationAPI dashboard
7. ✅ Notification received in foreground
8. ✅ Notification received in background
9. ✅ Tapping notification opens app

## Quick Test Without Physical Device

### iOS Simulator (macOS only):
- Can test most functionality
- **Cannot test push notifications** (simulator doesn't support APN)
- Good for: UI, initialization, API calls

### Android Emulator:
- Can test everything including push notifications
- Full FCM support in emulator
- Good for: Complete testing

## Troubleshooting

### "Command not found: react-native"
```bash
npm install -g react-native-cli
```

### "No devices found" (iOS)
- Make sure iPhone is unlocked
- Trust the computer on iPhone
- Check USB cable
- In Xcode: Window → Devices and Simulators → Check if device appears

### "Signing error" (iOS)
- Make sure you selected a Team in Xcode
- Free Apple ID works for development
- Bundle identifier might conflict - change it in Xcode

### "Pod install failed" (iOS)
```bash
cd ios
pod deintegrate
pod install
cd ..
```

## Recommended Testing Order

1. **Start with Android** (easier, works everywhere)
   - Test all functionality
   - Verify SDK works end-to-end

2. **Then test iOS** (if you have Mac + iPhone)
   - Verify iOS-specific code works
   - Test APN integration

## VSCode Setup

You can absolutely use VSCode for editing! You'll just need:

- **Terminal in VSCode** (or separate terminal) for running commands
- **Xcode** (for iOS) - only when building/running, not for editing
- **Android Studio** (for Android) - mainly for emulator, not required for editing

VSCode extensions that help:
- React Native Tools
- ESLint
- TypeScript

## Summary

**For iOS:**
- ✅ VSCode for editing (yes!)
- ✅ Xcode for building/running (required)
- ✅ iPhone connected (for real push notifications)
- ✅ Apple ID (free account works)

**For Android:**
- ✅ VSCode for editing (yes!)
- ✅ Android Studio for emulator (or use physical device)
- ✅ No special accounts needed

**Easiest path:** Start with Android emulator to verify everything works, then test on iOS if needed.

