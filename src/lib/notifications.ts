import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const SESSION_CHANNEL_ID = 'session';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let channelReady = false;

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android' || channelReady) return;
  await Notifications.setNotificationChannelAsync(SESSION_CHANNEL_ID, {
    name: 'Session reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
  channelReady = true;
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

/**
 * Schedules a local notification for when the running session's countdown reaches
 * zero, so a session that finishes while the app is backgrounded still notifies —
 * the in-app countdown alone can't do that off-screen.
 */
export async function scheduleSessionCompleteNotification(
  durationSeconds: number,
): Promise<string | null> {
  const granted = await requestNotificationPermissions();
  if (!granted) return null;
  await ensureAndroidChannel();

  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Session complete',
      body: "Well done — today is marked on your calendar.",
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, durationSeconds),
      repeats: false,
      channelId: SESSION_CHANNEL_ID,
    },
  });
}

export async function cancelScheduledNotification(id: string | null) {
  if (!id) return;
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}
