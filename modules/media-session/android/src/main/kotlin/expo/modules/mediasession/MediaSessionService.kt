package expo.modules.mediasession

import android.content.ComponentName
import android.content.Context
import android.media.MediaMetadata
import android.media.session.MediaController
import android.media.session.MediaSessionManager
import android.media.session.PlaybackState
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.service.notification.NotificationListenerService
import android.util.Log

class MediaSessionService : NotificationListenerService() {
    private var sessionManager: MediaSessionManager? = null
    private val controllerCallbacks = mutableMapOf<MediaController, MediaController.Callback>()
    private val mainHandler = Handler(Looper.getMainLooper())

    companion object {
        private const val TAG = "MediaSessionService"
        var activeController: MediaController? = null
            private set
    }

    private val sessionsListener = MediaSessionManager.OnActiveSessionsChangedListener { controllers ->
        mainHandler.post {
            onSessionsChanged(controllers)
        }
    }

    override fun onListenerConnected() {
        super.onListenerConnected()
        Log.d(TAG, "Listener connected")
        
        sessionManager = getSystemService(Context.MEDIA_SESSION_SERVICE) as MediaSessionManager
        val componentName = ComponentName(this, MediaSessionService::class.java)
        
        sessionManager?.addOnActiveSessionsChangedListener(sessionsListener, componentName)
        
        val controllers = sessionManager?.getActiveSessions(componentName)
        onSessionsChanged(controllers)
    }

    override fun onListenerDisconnected() {
        super.onListenerDisconnected()
        Log.d(TAG, "Listener disconnected")
        
        sessionManager?.removeOnActiveSessionsChangedListener(sessionsListener)
        
        controllerCallbacks.forEach { (controller, callback) ->
            controller.unregisterCallback(callback)
        }
        controllerCallbacks.clear()
        activeController = null
    }

    private fun onSessionsChanged(controllers: List<MediaController>?) {
        Log.d(TAG, "Sessions changed: ${controllers?.size ?: 0} active")
        
        val currentPackages = controllers?.map { it.packageName }?.toSet() ?: emptySet()
        val registeredPackages = controllerCallbacks.keys.map { it.packageName }.toSet()
        
        controllerCallbacks.entries.removeAll { (controller, callback) ->
            if (controller.packageName !in currentPackages) {
                controller.unregisterCallback(callback)
                true
            } else false
        }
        
        controllers?.forEach { controller ->
            if (controller.packageName !in registeredPackages) {
                registerControllerCallback(controller)
            }
        }
        
        controllers?.firstOrNull()?.let { first ->
            if (first.playbackState?.state == PlaybackState.STATE_PLAYING) {
                activeController = first
                emitMediaState(first)
            }
        }
    }

    private fun registerControllerCallback(controller: MediaController) {
        val callback = object : MediaController.Callback() {
            override fun onMetadataChanged(metadata: MediaMetadata?) {
                Log.d(TAG, "Metadata changed for ${controller.packageName}")
                emitMediaState(controller)
            }

            override fun onPlaybackStateChanged(state: PlaybackState?) {
                Log.d(TAG, "Playback state changed: ${state?.state} for ${controller.packageName}")
                if (state?.state == PlaybackState.STATE_PLAYING) {
                    activeController = controller
                }
                emitMediaState(controller)
            }
        }

        controller.registerCallback(callback, mainHandler)
        controllerCallbacks[controller] = callback
        Log.d(TAG, "Registered callback for ${controller.packageName}")
    }

    private fun emitMediaState(controller: MediaController) {
        val metadata = controller.metadata
        val state = controller.playbackState

        val stateString = when (state?.state) {
            PlaybackState.STATE_PLAYING -> "playing"
            PlaybackState.STATE_PAUSED -> "paused"
            PlaybackState.STATE_STOPPED -> "stopped"
            PlaybackState.STATE_BUFFERING -> "buffering"
            else -> "unknown"
        }

        var artworkUri: String? = null
        try {
             // Try to get the art bitmap
            val bitmap = metadata?.getBitmap(MediaMetadata.METADATA_KEY_ALBUM_ART)
                ?: metadata?.getBitmap(MediaMetadata.METADATA_KEY_ART)

            if (bitmap != null) {
                // Save to cache
                // We use the package name to avoid collisions if multiple apps are playing (though rare for active session)
                // Use a consistent name per package to overwrite old art and save space
                val file = java.io.File(cacheDir, "album_art_${controller.packageName}.png")
                val stream = java.io.FileOutputStream(file)
                bitmap.compress(android.graphics.Bitmap.CompressFormat.PNG, 100, stream)
                stream.close()
                artworkUri = "file://${file.absolutePath}"
            } else {
                 // Try string uri if bitmap is missing (less common for local players but possible)
                 val artUriStr = metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM_ART_URI)
                    ?: metadata?.getString(MediaMetadata.METADATA_KEY_ART_URI)
                 if (artUriStr != null) {
                     artworkUri = artUriStr
                 }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error saving artwork", e)
        }

        val bundle = Bundle().apply {
            putString("package", controller.packageName)
            putString("title", metadata?.getString(MediaMetadata.METADATA_KEY_TITLE) ?: "")
            putString("artist", metadata?.getString(MediaMetadata.METADATA_KEY_ARTIST)
                ?: metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM_ARTIST) ?: "")
            putString("album", metadata?.getString(MediaMetadata.METADATA_KEY_ALBUM) ?: "")
            putString("state", stateString)
            putString("artworkUri", artworkUri)
            putLong("position", state?.position ?: 0L)
            putLong("duration", metadata?.getLong(MediaMetadata.METADATA_KEY_DURATION) ?: 0L)
            putLong("timestamp", System.currentTimeMillis())
        }

        MediaEventManager.emitEvent(bundle)
    }
}
