import { NativeModules, Platform } from 'react-native';

interface PineDndNativeModule {
  isPermissionGranted(): Promise<boolean>;
  openPermissionSettings(): void;
  enable(): Promise<boolean>;
  disable(): Promise<boolean>;
}

// Do Not Disturb control requires Android's Notification Policy Access, which has
// no equivalent public API on iOS/web — this feature is Android-only everywhere below.
const PineDnd: PineDndNativeModule | undefined =
  Platform.OS === 'android' ? NativeModules.PineDnd : undefined;

export async function isDndPermissionGranted(): Promise<boolean> {
  if (!PineDnd) return false;
  return PineDnd.isPermissionGranted();
}

export function openDndPermissionSettings(): void {
  PineDnd?.openPermissionSettings();
}

/** Switches the system to Priority-only interruptions, remembering the prior filter. No-ops if permission hasn't been granted. */
export async function enableDoNotDisturb(): Promise<void> {
  await PineDnd?.enable();
}

/** Restores whatever interruption filter was active before `enableDoNotDisturb`. */
export async function disableDoNotDisturb(): Promise<void> {
  await PineDnd?.disable();
}
