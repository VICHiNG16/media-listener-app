package expo.modules.medialistener

import android.os.Bundle

object MediaEventManager {
  private var listener: ((Bundle) -> Unit)? = null

  fun setListener(l: (Bundle) -> Unit) {
    listener = l
  }

  fun emitEvent(data: Bundle) {
    listener?.invoke(data)
  }
}
