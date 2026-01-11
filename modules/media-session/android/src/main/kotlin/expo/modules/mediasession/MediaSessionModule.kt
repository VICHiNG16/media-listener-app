package expo.modules.mediasession

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Intent
import android.provider.Settings
import android.os.Bundle
import android.media.session.PlaybackState

class MediaSessionModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("MediaSession")

        Events("onMediaChanged")

        Function("requestPermission") {
            val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }

        Function("hasPermission") {
            val packageName = context.packageName
            val flat = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
            return@Function flat != null && flat.contains(packageName)
        }

        Function("play") {
            MediaSessionService.activeController?.transportControls?.play()
        }

        Function("pause") {
            MediaSessionService.activeController?.transportControls?.pause()
        }

        Function("skipNext") {
            MediaSessionService.activeController?.transportControls?.skipToNext()
        }

        Function("skipPrevious") {
            MediaSessionService.activeController?.transportControls?.skipToPrevious()
        }

        Function("getState") {
            val controller = MediaSessionService.activeController
            if (controller == null) return@Function null
            
            val metadata = controller.metadata
            val state = controller.playbackState
            
            val stateString = when (state?.state) {
                PlaybackState.STATE_PLAYING -> "playing"
                PlaybackState.STATE_PAUSED -> "paused"
                PlaybackState.STATE_STOPPED -> "stopped"
                PlaybackState.STATE_BUFFERING -> "buffering"
                else -> "unknown"
            }
            
            mapOf(
                "package" to controller.packageName,
                "title" to (metadata?.getString(android.media.MediaMetadata.METADATA_KEY_TITLE) ?: ""),
                "artist" to (metadata?.getString(android.media.MediaMetadata.METADATA_KEY_ARTIST) ?: ""),
                "album" to (metadata?.getString(android.media.MediaMetadata.METADATA_KEY_ALBUM) ?: ""),
                "state" to stateString,
                "position" to (state?.position ?: 0L),
                "duration" to (metadata?.getLong(android.media.MediaMetadata.METADATA_KEY_DURATION) ?: 0L)
            ).apply {
                // Determine artworkUri similar to Service logic for initial state get
                // Note: ideally we factor this logic out, but for now we approximate or wait for event
                // Actually, getState is often called first.
                // However, accessing context.cacheDir here is easy.
                // But the service saves the file. We should check if the file exists or rely on the service to emit it.
                // For direct synchronous getState, extracting bitmap again is heavy.
                // A better approach for getState:
                // We don't have easy access to the Bitmap here without the controller callbacks or re-querying.
                // Let's rely on the event or just try to check if the file exists from previous service runs?
                // No, that's flaky.
                // Let's just return null for artworkUri in synchronous getState for now, 
                // OR duplicate the extraction logic if we really want it. 
                // Given the user asked for "event.mediaGraphic", the event is the primary mechanism.
                // But consistency is good. Let's trying to support it if easy.
                
                // Retrying extraction:
                var artworkUri: String? = null
                try {
                     val bitmap = metadata?.getBitmap(android.media.MediaMetadata.METADATA_KEY_ALBUM_ART)
                        ?: metadata?.getBitmap(android.media.MediaMetadata.METADATA_KEY_ART)
                     if (bitmap != null) {
                         val file = java.io.File(context.cacheDir, "album_art_${controller.packageName}.png")
                         // Writing to disk on main thread/JS thread might be bad if image is huge, 
                         // but standard metadata icons are usually small.
                         val stream = java.io.FileOutputStream(file)
                         bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, stream)
                         stream.close()
                         artworkUri = "file://${file.absolutePath}"
                     } else {
                         val artUriStr = metadata?.getString(android.media.MediaMetadata.METADATA_KEY_ALBUM_ART_URI)
                            ?: metadata?.getString(android.media.MediaMetadata.METADATA_KEY_ART_URI)
                         if (artUriStr != null) artworkUri = artUriStr
                     }
                } catch(e: Exception) {}
                
                if (artworkUri != null) {
                    (this as MutableMap<String, Any?>)["artworkUri"] = artworkUri
                }
            }
        }

        OnStartObserving {
            MediaEventManager.setListener { bundle ->
                sendEvent("onMediaChanged", bundleToMap(bundle))
            }
        }
    }

    private fun bundleToMap(bundle: Bundle): Map<String, Any?> {
        val map = mutableMapOf<String, Any?>()
        for (key in bundle.keySet()) {
            map[key] = bundle.get(key)
        }
        return map
    }

    private val context
        get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }
}
