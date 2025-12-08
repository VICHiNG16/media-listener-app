package expo.modules.medialistener

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.os.Bundle
import android.util.Log

class MediaNotificationService : NotificationListenerService() {

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        processNotification(sbn)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {
        // Could clear state here if needed
    }

    private fun processNotification(sbn: StatusBarNotification) {
        try {
            val extras = sbn.notification.extras
            val template = extras.getString(Notification.EXTRA_TEMPLATE)
            
            val isMediaNotification = template == "android.app.Notification\$MediaStyle" || 
                                      sbn.packageName.contains("spotify") || 
                                      sbn.packageName.contains("music")

            if (isMediaNotification) {
                val bundle = Bundle().apply {
                    putString("package", sbn.packageName)
                    putString("title", extras.getString(Notification.EXTRA_TITLE))
                    putString("artist", extras.getString(Notification.EXTRA_TEXT))
                    putString("album", extras.getString(Notification.EXTRA_INFO_TEXT))
                }
                MediaEventManager.emitEvent(bundle)
            }
        } catch (e: Exception) {
            Log.e("MediaNotification", "Failed to process notification", e)
        }
    }
}
