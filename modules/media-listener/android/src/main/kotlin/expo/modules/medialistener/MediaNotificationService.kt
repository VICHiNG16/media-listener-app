package expo.modules.medialistener

import android.app.Notification
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.media.MediaMetadata
import android.os.Bundle
import android.util.Log

class MediaNotificationService : NotificationListenerService() {

  override fun onNotificationPosted(sbn: StatusBarNotification) {
    processNotification(sbn)
  }

  override fun onNotificationRemoved(sbn: StatusBarNotification) {
    // Optionally handle removal to clear state
  }

  private fun processNotification(sbn: StatusBarNotification) {
    try {
      val extras = sbn.notification.extras
      val title = extras.getString(Notification.EXTRA_TITLE)
      val text = extras.getString(Notification.EXTRA_TEXT)
      val artist = extras.getString(Notification.EXTRA_INFO_TEXT) // Often artist/album
      
      // Check if this looks like a media notification
      // A robust check would use MediaSession, but checking for media style or temple is a good start.
      val template = extras.getString(Notification.EXTRA_TEMPLATE)
      val isMedia = template == "android.app.Notification\$MediaStyle" || 
                    sbn.packageName.contains("spotify") || 
                    sbn.packageName.contains("music")

      if (isMedia) {
        val bundle = Bundle()
        bundle.putString("package", sbn.packageName)
        bundle.putString("title", title)
        bundle.putString("artist", text) // Sometimes text is artist
        bundle.putString("album", artist)
        
        // Try to get token if possible (requires MediaSessionManager, more complex - keeping it simple/raw for now as requested)

        MediaEventManager.emitEvent(bundle)
      }
    } catch (e: Exception) {
      Log.e("MediaNotification", "Error processing notification", e)
    }
  }
}
