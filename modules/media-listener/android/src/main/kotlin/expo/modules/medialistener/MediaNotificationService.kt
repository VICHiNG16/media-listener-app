package expo.modules.medialistener

import android.media.session.MediaController
import android.media.session.MediaSession
import android.media.session.PlaybackState
import android.media.MediaMetadata
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.os.Bundle
import android.util.Log

class MediaNotificationService : NotificationListenerService() {

    private val mediaApps = setOf(
        "com.spotify.music",
        "com.google.android.youtube",
        "com.google.android.apps.youtube.music",
        "com.amazon.mp3",
        "com.apple.android.music",
        "com.soundcloud.android",
        "deezer.android.app",
        "com.pandora.android",
        "com.aspiro.tidal",
        "com.jio.media.jiobeats",
        "in.startv.hotstar",
        "com.netflix.mediaclient"
    )

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        processNotification(sbn)
    }

    override fun onNotificationRemoved(sbn: StatusBarNotification) {}

    private fun processNotification(sbn: StatusBarNotification) {
        try {
            val pkg = sbn.packageName
            val extras = sbn.notification.extras
            
            // Check if it's a known media app OR has media session
            val mediaSession = extras.getParcelable<MediaSession.Token>(android.app.Notification.EXTRA_MEDIA_SESSION)
            val isKnownMediaApp = mediaApps.contains(pkg)
            val hasMediaContent = extras.containsKey(android.app.Notification.EXTRA_TITLE)
            
            if (mediaSession != null || isKnownMediaApp) {
                var title: String? = null
                var artist: String? = null
                var album: String? = null
                
                // Try to get metadata from MediaSession first (most reliable)
                if (mediaSession != null) {
                    try {
                        val controller = MediaController(this, mediaSession)
                        val metadata = controller.metadata
                        val state = controller.playbackState
                        
                        // Only emit if actually playing
                        if (state?.state == PlaybackState.STATE_PLAYING) {
                            title = metadata?.getString(MediaMetadata.METADATA_KEY_TITLE)
                            artist = metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST)
                                ?: metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST)
                            album = metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM)
                        } else {
                            return // Not playing, skip
                        }
                    } catch (e: Exception) {
                        Log.d("MediaListener", "MediaSession fallback to notification extras")
                    }
                }
                
                // Fallback to notification extras
                if (title == null) {
                    title = extras.getCharSequence(android.app.Notification.EXTRA_TITLE)?.toString()
                    artist = extras.getCharSequence(android.app.Notification.EXTRA_TEXT)?.toString()
                    album = extras.getCharSequence(android.app.Notification.EXTRA_SUB_TEXT)?.toString()
                        ?: extras.getCharSequence(android.app.Notification.EXTRA_INFO_TEXT)?.toString()
                }
                
                if (!title.isNullOrBlank()) {
                    val bundle = Bundle().apply {
                        putString("package", pkg)
                        putString("title", title)
                        putString("artist", artist ?: "")
                        putString("album", album ?: "")
                    }
                    MediaEventManager.emitEvent(bundle)
                }
            }
        } catch (e: Exception) {
            Log.e("MediaListener", "Error: ${e.message}")
        }
    }
}
