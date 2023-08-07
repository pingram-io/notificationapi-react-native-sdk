#import <Foundation/Foundation.h>
#import "RTNNotificationApiAppDelegate.h"

@implementation RTNNotificationApiAppDelegate

- (id) init {
    self = [super init];
    
    if (self) {
        [[UIApplication sharedApplication] registerForRemoteNotifications];
    }
    
    return(self);
}

//- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary<UIApplicationLaunchOptionsKey,id> *)launchOptions {
//
//}


@end
