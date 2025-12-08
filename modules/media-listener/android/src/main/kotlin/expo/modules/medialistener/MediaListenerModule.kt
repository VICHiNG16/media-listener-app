package expo.modules.medialistener

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.os.Bundle

class MediaListenerModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MediaListener")
    
    // Defines events that this module can send to JavaScript.
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
    
    OnStartObserving {
      MediaEventManager.setListener { bundle ->
        sendEvent("onMediaChanged", bundleToMap(bundle))
      }
    }
  }

  private fun bundleToMap(bundle: Bundle): Map<String, Any?> {
    val map = mutableMapOf<String, Any?>()
    val keys = bundle.keySet()
    if (keys != null) {
      for (key in keys) {
        map[key] = bundle.get(key)
      }
    }
    return map
  }

  private val context
    get() = requireNotNull(appContext.reactContext) { "React Application Context is null" }
}
