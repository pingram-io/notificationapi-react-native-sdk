package com.notificationapi.rn

import android.os.Build
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import com.notificationapi.rn.NativeNotificationApiSpec
import com.notificationapi.notificationapi_android_sdk.NotificationApi
import com.notificationapi.notificationapi_android_sdk.models.NotificationApiCredentials
import com.google.firebase.messaging.FirebaseMessaging
import android.provider.Settings

class NotificationApiModule(reactContext: ReactApplicationContext) : NativeNotificationApiSpec(reactContext) {

  companion object {
    const val NAME = "NotificationApiReactNativeSdk"
  }

  override fun getName() = NAME

  override fun configure(clientId: String, userId: String, hashedUserId: String?) {
    NotificationApi.shared.configure(NotificationApiCredentials(clientId, userId, hashedUserId))
  }

  override fun requestNotificationPermission(promise: Promise) {
    try {
      NotificationApi.shared.askNotificationPermissions()
      // Note: The actual permission result will come via event emitter
      // For now, we'll resolve immediately and let the event handle the actual result
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("PERMISSION_ERROR", e.message, e)
    }
  }

  override fun getPushToken(promise: Promise) {
    try {
      FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
        if (task.isSuccessful) {
          val token = task.result
          promise.resolve(token)
        } else {
          val exception = task.exception
          promise.reject("TOKEN_ERROR", exception?.message ?: "Failed to get push token", exception)
        }
      }
    } catch (e: Exception) {
      promise.reject("TOKEN_ERROR", e.message, e)
    }
  }

  override fun getDeviceInfo(promise: Promise) {
    try {
      val deviceInfo = Arguments.createMap()
      
      // Get Android ID as device ID
      val deviceId = Settings.Secure.getString(
        reactApplicationContext.contentResolver,
        Settings.Secure.ANDROID_ID
      ) ?: "unknown_device"
      deviceInfo.putString("deviceId", deviceId)
      
      // Platform
      deviceInfo.putString("platform", "android")
      
      // Manufacturer
      deviceInfo.putString("manufacturer", Build.MANUFACTURER)
      
      // Model
      deviceInfo.putString("model", Build.MODEL)
      
      // App ID (package name)
      deviceInfo.putString("appId", reactApplicationContext.packageName)
      
      promise.resolve(deviceInfo)
    } catch (e: Exception) {
      promise.reject("DEVICE_INFO_ERROR", e.message, e)
    }
  }
}