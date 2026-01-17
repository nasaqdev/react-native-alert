package com.alert

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AlertViewPackage : ReactPackage {
  private val delegate = AlertPackage()

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return delegate.createViewManagers(reactContext)
  }

  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return delegate.createNativeModules(reactContext)
  }
}
