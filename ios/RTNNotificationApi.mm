#import "RTNNotificationApiSpec.h"
#import "RTNNotificationApi.h"
// #import <NotificationApi_Ios_Sdk/NotificationApi_Ios_Sdk-Swift.h>

@implementation RTNNotificationApi

RCT_EXPORT_MODULE()

- (void)configure:(NSString *)clientId userId:(NSString *)userId hashedUserId:(NSString * _Nullable)hashedUserId {
    // NotificationApiCredentials * credentials = [NotificationApiCredentials initWithClientId:clientId userId:userId hashedUserId:hashedUserId];
    // [[NotificationApi shared] configureWithCredentials:credentials withConfig:nil];
}

- (void)requestNotificationPermission {
    // [[NotificationApi shared] requestAuthorizationWithCompletionHandler:^(BOOL isGranted, NSError * _Nullable error) {
    //     if (error != nil) {
    //         NSLog(@"Error: %@", error);
    //         return;
    //     }
        
    //     [self sendEventWithName:@"notificationapi_notification_permissions_requested" body:@{ @"isGranted": @(isGranted)}];
    // }];
}

- (void)addListener:(NSString *)eventType {

}


- (void)removeListeners:(double)count {
    
}


- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeNotificationApiSpecJSI>(params);
}

- (NSArray<NSString *> *)supportedEvents {
    return @[@"notificationapi_notification_permissions_requested"];
}

@end
