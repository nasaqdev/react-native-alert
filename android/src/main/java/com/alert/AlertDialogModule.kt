package com.alert

import androidx.appcompat.app.AlertDialog
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.GradientDrawable
import android.graphics.drawable.RippleDrawable
import android.util.TypedValue
import android.view.ContextThemeWrapper
import android.view.Gravity
import android.view.View
import android.widget.LinearLayout
import android.widget.ProgressBar
import android.widget.TextView
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.uimanager.PixelUtil
import com.google.android.material.dialog.MaterialAlertDialogBuilder

class AlertDialogModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private var alertDialog: AlertDialog? = null
  private var themedContext: Context? = null

  override fun getName(): String {
    return NAME
  }

  @ReactMethod
  fun show(options: ReadableMap) {
    val activity = reactContext.currentActivity ?: return
    UiThreadUtil.runOnUiThread {
      dismissInternal()

      val cancelable = getBoolean(options, "cancelable") ?: true
      val orderedButtons = getOrderedButtons(options)

      themedContext = ContextThemeWrapper(
        activity,
        com.google.android.material.R.style.Theme_Material3_DayNight
      )
      val dialogContext = themedContext ?: activity

      val container = LinearLayout(dialogContext)
      container.orientation = LinearLayout.VERTICAL
      container.setPadding(dp(20), dp(16), dp(20), dp(12))

      val backgroundDrawable = GradientDrawable()
      backgroundDrawable.shape = GradientDrawable.RECTANGLE
      val defaultBackground = resolveThemeColor(
        com.google.android.material.R.attr.colorSurface
      )
      backgroundDrawable.setColor(getColor(options, "backgroundColor") ?: defaultBackground)
      backgroundDrawable.cornerRadius = dpF(getDouble(options, "cornerRadius") ?: 20.0)
      val borderColor = getColor(options, "borderColor") ?: Color.TRANSPARENT
      val borderWidth = getDouble(options, "borderWidth") ?: 0.0
      backgroundDrawable.setStroke(dp(borderWidth), borderColor)
      container.background = backgroundDrawable

      val contentRow = LinearLayout(dialogContext)
      contentRow.orientation = LinearLayout.HORIZONTAL
      contentRow.gravity = Gravity.CENTER_VERTICAL

      val title = getString(options, "title")
      val message = getString(options, "message")
      val showLoading = getBoolean(options, "loading") ?: false

      if (showLoading) {
        val loadingView = ProgressBar(dialogContext)
        val sizeDp = getDouble(options, "loadingSize")
        val sizePx = sizeDp?.let { dp(it) } ?: dp(22)
        val params = LinearLayout.LayoutParams(sizePx, sizePx)
        params.marginEnd = dp(12)
        loadingView.layoutParams = params
        val tintColor = getColor(options, "loadingColor")
        if (tintColor != null) {
          loadingView.indeterminateTintList = ColorStateList.valueOf(tintColor)
        }
        contentRow.addView(loadingView)
      }

      val textColumn = LinearLayout(dialogContext)
      textColumn.orientation = LinearLayout.VERTICAL
      textColumn.layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.MATCH_PARENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )

      if (title != null) {
        val titleView = TextView(dialogContext)
        titleView.text = title
        titleView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 18f)
        titleView.setTypeface(Typeface.DEFAULT, Typeface.BOLD)
        val defaultTitleColor =
          resolveThemeColor(com.google.android.material.R.attr.colorOnSurface)
        titleView.setTextColor(getColor(options, "titleColor") ?: defaultTitleColor)
        textColumn.addView(titleView)
      }

      if (message != null) {
        val messageView = TextView(dialogContext)
        messageView.text = message
        messageView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
        val defaultMessageColor =
          resolveThemeColor(com.google.android.material.R.attr.colorOnSurfaceVariant)
        messageView.setTextColor(getColor(options, "messageColor") ?: defaultMessageColor)
        val params = LinearLayout.LayoutParams(
          LinearLayout.LayoutParams.MATCH_PARENT,
          LinearLayout.LayoutParams.WRAP_CONTENT
        )
        params.topMargin = dp(6)
        messageView.layoutParams = params
        textColumn.addView(messageView)
      }

      if (title != null || message != null) {
        contentRow.addView(textColumn)
        container.addView(contentRow)
      }

      if (orderedButtons.isNotEmpty()) {
        val buttonRow = LinearLayout(dialogContext)
        buttonRow.orientation = LinearLayout.HORIZONTAL
        buttonRow.gravity = Gravity.CENTER_VERTICAL
        val params = LinearLayout.LayoutParams(
          LinearLayout.LayoutParams.MATCH_PARENT,
          LinearLayout.LayoutParams.WRAP_CONTENT
        )
        params.topMargin = dp(12)
        buttonRow.layoutParams = params

        val rightGroup = LinearLayout(dialogContext)
        rightGroup.orientation = LinearLayout.HORIZONTAL
        rightGroup.gravity = Gravity.END or Gravity.CENTER_VERTICAL

        if (orderedButtons.size == 3) {
          val leftGroup = LinearLayout(dialogContext)
          leftGroup.orientation = LinearLayout.HORIZONTAL
          leftGroup.gravity = Gravity.START or Gravity.CENTER_VERTICAL
          val leftParams = LinearLayout.LayoutParams(
            0,
            LinearLayout.LayoutParams.WRAP_CONTENT,
            1f
          )
          leftGroup.layoutParams = leftParams

          val primaryButton = orderedButtons.first()
          val secondaryButtons = orderedButtons.drop(1)
          leftGroup.addView(
            createButtonView(secondaryButtons[0].map, secondaryButtons[0].index)
          )
          rightGroup.addView(
            createButtonView(secondaryButtons[1].map, secondaryButtons[1].index)
          )
          rightGroup.addView(createButtonView(primaryButton.map, primaryButton.index))
          buttonRow.addView(leftGroup)
          buttonRow.addView(rightGroup)
        } else {
          val rightParams = LinearLayout.LayoutParams(
            LinearLayout.LayoutParams.MATCH_PARENT,
            LinearLayout.LayoutParams.WRAP_CONTENT
          )
          rightGroup.layoutParams = rightParams
          if (orderedButtons.size == 2) {
            rightGroup.addView(createButtonView(orderedButtons[1].map, orderedButtons[1].index))
            rightGroup.addView(createButtonView(orderedButtons[0].map, orderedButtons[0].index))
          } else {
            for (button in orderedButtons) {
              rightGroup.addView(createButtonView(button.map, button.index))
            }
          }
          buttonRow.addView(rightGroup)
        }

        container.addView(buttonRow)
      }

      val builder = MaterialAlertDialogBuilder(dialogContext)
      builder.setView(container)
      builder.setCancelable(cancelable)
      val dialog = builder.create()
      dialog.window?.setBackgroundDrawable(ColorDrawable(Color.TRANSPARENT))
      dialog.setCanceledOnTouchOutside(cancelable)
      dialog.setOnDismissListener {
        emitEvent("dismiss", null)
      }
      alertDialog = dialog
      dialog.show()
    }
  }

  @ReactMethod
  fun dismiss() {
    UiThreadUtil.runOnUiThread {
      dismissInternal()
    }
  }

  @ReactMethod
  fun addListener(eventName: String) {
    // Required for NativeEventEmitter.
  }

  @ReactMethod
  fun removeListeners(count: Int) {
    // Required for NativeEventEmitter.
  }

  private fun dismissInternal() {
    alertDialog?.dismiss()
    alertDialog = null
    themedContext = null
  }

  private fun createButtonView(button: ReadableMap, index: Int): View {
    val text = getString(button, "text") ?: "OK"
    val id = getString(button, "id") ?: index.toString()
    val dismissOnPress = getBoolean(button, "dismissOnPress") ?: true
    val textColor =
      getColor(button, "textColor")
        ?: resolveThemeColor(androidx.appcompat.R.attr.colorPrimary)

    val textView = TextView(themedContext ?: reactContext)
    textView.text = text
    textView.setTextColor(textColor)
    textView.setTextSize(TypedValue.COMPLEX_UNIT_SP, 15f)
    textView.setPadding(dp(16), dp(8), dp(16), dp(8))
    textView.isClickable = true
    textView.isFocusable = true
    textView.background = getCapsuleRipple(getColor(button, "rippleColor"))
    textView.setOnClickListener {
      val payload = Arguments.createMap()
      payload.putString("id", id)
      emitEvent("action", payload)
      if (dismissOnPress) {
        dismiss()
      }
    }

    return textView
  }

  private fun emitEvent(type: String, payload: ReadableMap?) {
    val event = Arguments.createMap()
    event.putString("type", type)
    if (payload != null) {
      event.putMap("payload", payload)
    }
    reactContext
      .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
      .emit(EVENT_NAME, event)
  }

  private fun createPayload(button: ReadableMap, index: Int): ReadableMap {
    val id = getString(button, "id") ?: index.toString()
    val payload = Arguments.createMap()
    payload.putString("id", id)
    return payload
  }

  private data class ButtonSpec(val map: ReadableMap, val order: Double?, val index: Int)

  private fun getOrderedButtons(options: ReadableMap): List<ButtonSpec> {
    val buttons = options.getArray("buttons") ?: return emptyList()
    val list = ArrayList<ButtonSpec>(buttons.size())
    for (i in 0 until buttons.size()) {
      val button = buttons.getMap(i) ?: continue
      val order = if (button.hasKey("order") && !button.isNull("order")) {
        button.getDouble("order")
      } else {
        null
      }
      list.add(ButtonSpec(button, order, i))
    }
    val sorted =
      list.sortedWith(compareBy<ButtonSpec> { it.order ?: it.index.toDouble() }.thenBy { it.index })
    return if (sorted.size > 3) sorted.take(3) else sorted
  }

  private fun getCapsuleRipple(rippleColor: Int?): android.graphics.drawable.Drawable? {
    val highlightColor = rippleColor ?: resolveThemeColor(android.R.attr.colorControlHighlight)
    val mask = GradientDrawable()
    mask.shape = GradientDrawable.RECTANGLE
    mask.cornerRadius = dp(999).toFloat()
    return RippleDrawable(ColorStateList.valueOf(highlightColor), null, mask)
  }

  private fun resolveThemeColor(attr: Int): Int {
    val typedValue = android.util.TypedValue()
    val context = themedContext ?: reactContext
    val resolved = context.theme?.resolveAttribute(attr, typedValue, true) ?: false
    return if (resolved) typedValue.data else Color.parseColor("#33000000")
  }

  private fun getString(map: ReadableMap, key: String): String? {
    return if (map.hasKey(key) && !map.isNull(key)) map.getString(key) else null
  }

  private fun getColor(map: ReadableMap, key: String): Int? {
    return if (map.hasKey(key) && !map.isNull(key)) map.getInt(key) else null
  }

  private fun getDouble(map: ReadableMap, key: String): Double? {
    return if (map.hasKey(key) && !map.isNull(key)) map.getDouble(key) else null
  }

  private fun getBoolean(map: ReadableMap, key: String): Boolean? {
    return if (map.hasKey(key) && !map.isNull(key)) map.getBoolean(key) else null
  }

  private fun dp(value: Double): Int {
    return PixelUtil.toPixelFromDIP(value.toFloat()).toInt()
  }

  private fun dp(value: Int): Int {
    return PixelUtil.toPixelFromDIP(value.toFloat()).toInt()
  }

  private fun dpF(value: Double): Float {
    return PixelUtil.toPixelFromDIP(value.toFloat())
  }

  companion object {
    const val NAME = "AlertDialogModule"
    const val EVENT_NAME = "AlertDialogEvent"
  }
}
