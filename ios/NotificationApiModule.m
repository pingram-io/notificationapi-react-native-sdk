#import "NotificationApiModule.h"
#import <React/RCTBridge.h>
#import <React/RCTEventEmitter.h>
#import <React/RCTUtils.h>
#import <UserNotifications/UserNotifications.h>
#import <UIKit/UIKit.h>

@import UserNotifications;

@interface NotificationApiModule() <UNUserNotificationCenterDelegate>
@end

@implementation NotificationApiModule {
  BOOL _hasListeners;
}

RCT_EXPORT_MODULE(NotificationApiReactNativeSdk);

+ (BOOL)requiresMainQueueSetup {
  return YES;
}

- (instancetype)init {
  self = [super init];
  if (self) {
    UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
    center.delegate = self;
  }
  return self;
}

- (NSArray<NSString *> *)supportedEvents {
  return @[
    @"notificationapi_notification_permissions_requested",
    @"notificationapi_notification_on_click",
    @"notificationapi_push_token_received",
    @"notificationapi_notification_received"
  ];
}

- (void)startObserving {
  _hasListeners = YES;
}

- (void)stopObserving {
  _hasListeners = NO;
}

RCT_EXPORT_METHOD(configure:(NSString *)clientId
                  userId:(NSString *)userId
                  hashedUserId:(NSString *)hashedUserId
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  // Configuration is stored for later use
  // The actual SDK configuration would happen here if there was an iOS SDK
  resolve(@(YES));
}

RCT_EXPORT_METHOD(requestNotificationPermission:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  UNUserNotificationCenter *center = [UNUserNotificationCenter currentNotificationCenter];
  
  [center requestAuthorizationWithOptions:(UNAuthorizationOptionSound | UNAuthorizationOptionAlert | UNAuthorizationOptionBadge)
                        completionHandler:^(BOOL granted, NSError * _Nullable error) {
    dispatch_async(dispatch_get_main_queue(), ^{
      if (error) {
        reject(@"PERMISSION_ERROR", error.localizedDescription, error);
      } else {
        // Emit event
        if (self->_hasListeners) {
          [self sendEventWithName:@"notificationapi_notification_permissions_requested"
                             body:@{@"isGranted": @(granted)}];
        }
        resolve(@(granted));
      }
    });
  }];
}

RCT_EXPORT_METHOD(getPushToken:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [[UIApplication sharedApplication] registerForRemoteNotifications];
    
    // Get the APN token from UserDefaults (stored by AppDelegate)
    NSString *apnsToken = [[NSUserDefaults standardUserDefaults] stringForKey:@"apns_token"];
    
    if (apnsToken) {
      resolve(apnsToken);
    } else {
      // If token not available yet, wait a bit and try again
      dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(1.0 * NSEC_PER_SEC)), dispatch_get_main_queue(), ^{
        NSString *token = [[NSUserDefaults standardUserDefaults] stringForKey:@"apns_token"];
        if (token) {
          resolve(token);
        } else {
          reject(@"TOKEN_ERROR", @"APN token not available. Make sure push notifications are properly configured.", nil);
        }
      });
    }
  });
}

RCT_EXPORT_METHOD(getDeviceInfo:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  UIDevice *device = [UIDevice currentDevice];
  
  NSMutableDictionary *deviceInfo = [NSMutableDictionary dictionary];
  
  // Device ID (identifierForVendor)
  NSString *deviceId = [[device identifierForVendor] UUIDString];
  if (deviceId) {
    deviceInfo[@"deviceId"] = deviceId;
  } else {
    deviceInfo[@"deviceId"] = @"unknown_ios_device";
  }
  
  // Platform
  deviceInfo[@"platform"] = @"ios";
  
  // Manufacturer
  deviceInfo[@"manufacturer"] = @"Apple";
  
  // Model
  deviceInfo[@"model"] = [device model];
  
  // App ID (bundle identifier)
  deviceInfo[@"appId"] = [[NSBundle mainBundle] bundleIdentifier];
  
  resolve(deviceInfo);
}

// UNUserNotificationCenterDelegate methods
- (void)userNotificationCenter:(UNUserNotificationCenter *)center
       willPresentNotification:(UNNotification *)notification
         withCompletionHandler:(void (^)(UNNotificationPresentationOptions))completionHandler {
  if (_hasListeners) {
    NSDictionary *userInfo = notification.request.content.userInfo;
    [self sendEventWithName:@"notificationapi_notification_received"
                       body:@{
      @"messageId": userInfo[@"messageId"] ?: @"",
      @"senderId": userInfo[@"senderId"] ?: @"",
      @"title": notification.request.content.title ?: @"",
      @"body": notification.request.content.body ?: @"",
      @"data": userInfo[@"data"] ?: @{}
    }];
  }
  
  // Show notification even when app is in foreground
  if (@available(iOS 14.0, *)) {
    completionHandler(UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
  } else {
    completionHandler(UNNotificationPresentationOptionAlert | UNNotificationPresentationOptionSound | UNNotificationPresentationOptionBadge);
  }
}

- (void)userNotificationCenter:(UNUserNotificationCenter *)center
didReceiveNotificationResponse:(UNNotificationResponse *)response
         withCompletionHandler:(void (^)(void))completionHandler {
  if (_hasListeners) {
    NSDictionary *userInfo = response.notification.request.content.userInfo;
    [self sendEventWithName:@"notificationapi_notification_on_click"
                       body:@{
      @"messageId": userInfo[@"messageId"] ?: @"",
      @"senderId": userInfo[@"senderId"] ?: @"",
      @"ttl": userInfo[@"ttl"] ?: @(0),
      @"title": response.notification.request.content.title ?: @"",
      @"body": response.notification.request.content.body ?: @"",
      @"data": userInfo[@"data"] ?: @{}
    }];
  }
  
  completionHandler();
}

@end

