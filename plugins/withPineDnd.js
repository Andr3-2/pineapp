const { withMainApplication, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// Keep in sync with `android.package` in app.json.
const PACKAGE_NAME = 'com.pineapp.pine';
const PACKAGE_PATH = PACKAGE_NAME.replace(/\./g, '/');

const MODULE_KT = `package ${PACKAGE_NAME}

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * Toggles Android's system-wide "Priority only" Do Not Disturb filter for the
 * duration of a meditation session. Requires the user to grant Notification
 * Policy Access via Settings — there is no runtime permission dialog for this,
 * only the ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS deep link.
 *
 * Priority-only DND silences media playback by default unless the policy's
 * PRIORITY_CATEGORY_MEDIA bit is set, which would otherwise mute the app's own
 * ambient session audio the moment DND turns on — so enable() explicitly adds
 * that bit (on top of whatever the user already allows) and disable() restores
 * their original policy, not just the filter.
 */
class PineDndModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

  private var previousFilter: Int? = null
  private var previousPolicy: NotificationManager.Policy? = null

  override fun getName() = "PineDnd"

  private fun notificationManager(): NotificationManager {
    return reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
  }

  @ReactMethod
  fun isPermissionGranted(promise: Promise) {
    promise.resolve(notificationManager().isNotificationPolicyAccessGranted)
  }

  @ReactMethod
  fun openPermissionSettings() {
    val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
    intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
    reactApplicationContext.startActivity(intent)
  }

  @ReactMethod
  fun enable(promise: Promise) {
    val nm = notificationManager()
    if (!nm.isNotificationPolicyAccessGranted) {
      promise.resolve(false)
      return
    }
    if (previousFilter == null) {
      previousFilter = nm.currentInterruptionFilter
      previousPolicy = nm.notificationPolicy
    }

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      val policy = nm.notificationPolicy
      nm.notificationPolicy = NotificationManager.Policy(
        policy.priorityCategories or NotificationManager.Policy.PRIORITY_CATEGORY_MEDIA,
        policy.priorityCallSenders,
        policy.priorityMessageSenders,
        policy.suppressedVisualEffects,
      )
    }
    nm.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
    promise.resolve(true)
  }

  @ReactMethod
  fun disable(promise: Promise) {
    val nm = notificationManager()
    if (nm.isNotificationPolicyAccessGranted) {
      nm.setInterruptionFilter(previousFilter ?: NotificationManager.INTERRUPTION_FILTER_ALL)
      previousPolicy?.let { nm.notificationPolicy = it }
    }
    previousFilter = null
    previousPolicy = null
    promise.resolve(true)
  }
}
`;

const PACKAGE_KT = `package ${PACKAGE_NAME}

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class PineDndPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf(PineDndModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
`;

function withPineDndNativeFiles(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const dir = path.join(
        config.modRequest.platformProjectRoot,
        'app/src/main/java',
        PACKAGE_PATH,
      );
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'PineDndModule.kt'), MODULE_KT);
      fs.writeFileSync(path.join(dir, 'PineDndPackage.kt'), PACKAGE_KT);
      return config;
    },
  ]);
}

function withPineDndRegistration(config) {
  return withMainApplication(config, (config) => {
    const contents = config.modResults.contents;
    if (!contents.includes('PineDndPackage')) {
      config.modResults.contents = contents.replace(
        '.packages.apply {',
        `.packages.apply {\n          add(${PACKAGE_NAME}.PineDndPackage())`,
      );
    }
    return config;
  });
}

module.exports = function withPineDnd(config) {
  config = withPineDndNativeFiles(config);
  config = withPineDndRegistration(config);
  return config;
};
