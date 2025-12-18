package com.notificationapi.rn

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.RingtoneManager
import android.os.Build
import androidx.core.app.NotificationCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage

class NotificationApiFirebaseMessagingService : FirebaseMessagingService() {
    
    override fun onMessageReceived(remoteMessage: RemoteMessage) {
        super.onMessageReceived(remoteMessage)
        
        android.util.Log.d("NotificationAPI", "onMessageReceived called")
        android.util.Log.d("NotificationAPI", "Message ID: ${remoteMessage.messageId}")
        android.util.Log.d("NotificationAPI", "From: ${remoteMessage.from}")
        android.util.Log.d("NotificationAPI", "Data: ${remoteMessage.data}")
        android.util.Log.d("NotificationAPI", "Notification: ${remoteMessage.notification?.title} - ${remoteMessage.notification?.body}")
        
        // Show the notification
        showNotification(remoteMessage)
        
        // Emit event to React Native
        sendNotificationReceivedEvent(remoteMessage)
    }
    
    override fun onNewToken(token: String) {
        super.onNewToken(token)
        android.util.Log.d("NotificationAPI", "New FCM token received: $token")
        // Token refresh is handled by the SDK's sync mechanism via the React Native layer
    }
    
    private fun showNotification(remoteMessage: RemoteMessage) {
        android.util.Log.d("NotificationAPI", "showNotification called")
        
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        
        // Create notification channel for Android 8.0+
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                "notificationapi_channel",
                "NotificationAPI",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "NotificationAPI push notifications"
                enableVibration(true)
                enableLights(true)
            }
            notificationManager.createNotificationChannel(channel)
            android.util.Log.d("NotificationAPI", "Notification channel created")
        }
        
        // Extract title and body
        val title = remoteMessage.data["title"] ?: remoteMessage.notification?.title ?: "Notification"
        val body = remoteMessage.data["body"] ?: remoteMessage.notification?.body ?: ""
        
        // Create intent for when notification is clicked
        // Use the launcher activity from the package
        val intent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
            // Add notification data to intent
            remoteMessage.data.forEach { (key, value) ->
                putExtra(key, value)
            }
        } ?: Intent().apply {
            setPackage(packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            remoteMessage.data.forEach { (key, value) ->
                putExtra(key, value)
            }
        }
        
        val pendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )
        
        // Get app icon - try to use the app's launcher icon
        val iconResId = try {
            val appInfo = packageManager.getApplicationInfo(packageName, 0)
            appInfo.icon
        } catch (e: Exception) {
            android.R.drawable.ic_dialog_info
        }
        
        // Build notification
        val notificationBuilder = NotificationCompat.Builder(this, "notificationapi_channel")
            .setSmallIcon(iconResId)
            .setContentTitle(title)
            .setContentText(body)
            .setAutoCancel(true)
            .setSound(RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION))
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
        
        // Show notification
        val notificationId = remoteMessage.messageId?.hashCode() ?: System.currentTimeMillis().toInt()
        notificationManager.notify(notificationId, notificationBuilder.build())
        android.util.Log.d("NotificationAPI", "Notification shown with ID: $notificationId, Title: $title, Body: $body")
    }
    
    private fun sendNotificationReceivedEvent(remoteMessage: RemoteMessage) {
        val reactContext = NotificationApiModule.getReactContext()
        reactContext?.let { context ->
            val params = Arguments.createMap().apply {
                putString("messageId", remoteMessage.messageId)
                putString("senderId", remoteMessage.from)
                
                // Extract title and body from data or notification
                val title = remoteMessage.data["title"] ?: remoteMessage.notification?.title
                val body = remoteMessage.data["body"] ?: remoteMessage.notification?.body
                
                putString("title", title ?: "")
                putString("body", body ?: "")
                
                // Add all data fields
                val dataMap = Arguments.createMap()
                remoteMessage.data.forEach { (key, value) ->
                    dataMap.putString(key, value)
                }
                putMap("data", dataMap)
            }
            
            context
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                ?.emit(NotificationApiEvent.NOTIFICATION_RECEIVED.eventName, params)
        }
    }
}

