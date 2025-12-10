package com.notificationapi.rn

enum class NotificationApiEvent(val eventName: String) {
    NOTIFICATION_PERMISSIONS_REQUESTED("notificationapi_notification_permissions_requested"),
    NOTIFICATION_ON_CLICK("notificationapi_notification_on_click"),
    NOTIFICATION_RECEIVED("notificationapi_notification_received")
}