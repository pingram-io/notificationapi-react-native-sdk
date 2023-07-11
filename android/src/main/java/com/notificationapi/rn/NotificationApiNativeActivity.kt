package com.notificationapi.rn

import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.RemoteMessage
import com.notificationapi.notificationapi_android_sdk.NotificationApi
import com.notificationapi.notificationapi_android_sdk.utils.getRemoteMessage

open class NotificationApiNativeActivity: ReactActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        NotificationApi.initialize(context = this)
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)

        if (requestCode == NotificationApi.NOTIFICATION_PERMISSION_REQUEST) {
            val isGranted = grantResults[0] == PackageManager.PERMISSION_GRANTED
            sendEvent(NotificationApiEvent.NOTIFICATION_PERMISSIONS_REQUESTED, Arguments.createMap().apply { putBoolean("isGranted", isGranted) })
            onNotificationRequestPermissionResult(isGranted)
        }
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)

        intent?.getRemoteMessage()?.let {
            intent.extras?.remove(NotificationApi.NOTIFICATION_INTENT_KEY)

            val params = Arguments.createMap().apply {
                putString("messageId", it.messageId)
                putString("senderId", it.senderId)
                putInt("ttl", it.ttl)
                putString("title", it.data["title"] ?: it.notification?.title)
                putString("body", it.data["body"] ?: it.notification?.body)

                val data = it.data.apply {
                    remove("title")
                    remove("body")
                }

                putMap("data", Arguments.makeNativeMap(data as Map<String, Any>?))
            }

            sendEvent(NotificationApiEvent.NOTIFICATION_ON_CLICK, params)
            onNotificationClicked(it)
        }
    }

    fun sendEvent(event: NotificationApiEvent, params: WritableMap?) {
        reactInstanceManager.currentReactContext?.let {
            it.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)?.emit(event.eventName, params)
        }
    }

    open fun onNotificationClicked(message: RemoteMessage) { }

    open fun onNotificationRequestPermissionResult(isGranted: Boolean) { }
}