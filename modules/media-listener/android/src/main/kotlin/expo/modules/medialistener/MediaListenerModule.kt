package expo.modules.medialistener

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Intent
import android.provider.Settings
import android.os.Bundle

class MediaListenerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("MediaListener")
        
        Events("onMediaChanged")

        Function("requestPermission") {
            val intent = Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }

        Function("hasPermission") {
            val packageName = context.packageName
            val listeners = Settings.Secure.getString(context.contentResolver, "enabled_notification_listeners")
            return@Function listeners != null && listeners.contains(packageName)
        }
        
        OnStartObserving {
            MediaEventManager.setListener { bundle ->
                sendEvent("onMediaChanged", bundleToMap(bundle))
            }
        }
    }

    private fun bundleToMap(bundle: Bundle): Map<String, Any?> {
        return bundle.keySet().associateWith { bundle.get(it) }
    }

    private val context
        get() = requireNotNull(appContext.reactContext)
}
