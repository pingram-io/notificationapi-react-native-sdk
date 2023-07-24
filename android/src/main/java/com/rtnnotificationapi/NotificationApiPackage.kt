package com.rtnnotificationapi

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class NotificationApiPackage : TurboReactPackage() {
override fun getModule(name: String?, reactContext: ReactApplicationContext): NativeModule? =
  if (name == NotificationApiModule.NAME) {
    NotificationApiModule(reactContext)
  } else {
    null
  }

override fun getReactModuleInfoProvider() = ReactModuleInfoProvider {
  mapOf(
    NotificationApiModule.NAME to ReactModuleInfo(
      NotificationApiModule.NAME,
      NotificationApiModule.NAME,
      false, // canOverrideExistingModule
      false, // needsEagerInit
      true, // hasConstants
      false, // isCxxModule
      true // isTurboModule
    )
  )
}
}