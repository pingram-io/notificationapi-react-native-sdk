package com.rtnnotificationapi

import com.facebook.react.bridge.ReactApplicationContext
import com.rtnnotificationapi.NativeNotificationApiSpec
import com.notificationapi.notificationapi_android_sdk.NotificationApi
import com.notificationapi.notificationapi_android_sdk.models.NotificationApiCredentials

class NotificationApiModule(reactContext: ReactApplicationContext) : NativeNotificationApiSpec(reactContext) {

  companion object {
    const val NAME = "RTNNotificationApi"
  }

  override fun getName() = NAME

  override fun configure(clientId: String, userId: String, hashedUserId: String?) {
    NotificationApi.shared.configure(NotificationApiCredentials(clientId, userId, hashedUserId))
  }

  override fun requestNotificationPermission() {
    NotificationApi.shared.askNotificationPermissions()
  }
}