#import "RTNNotificationApiSpec.h"
#import "RTNNotificationApi.h"

@implementation RTNNotificationApi : NSObject

RCT_EXPORT_MODULE()

- (void)configure:(NSString *)clientId userId:(NSString *)userId hashedUserId:(NSString *)hashedUserId {
    
}

- (void)requestNotificationPermission {

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

@end
