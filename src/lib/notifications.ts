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

export function reminderNotificationContent(selectedDuration: number): { title: string; body: string } {
  return { title: "It's time to breathe", body: `Spare ${selectedDuration} min to be calmer.` };
}

const REMINDER_CHANNEL_ID = 'reminders';
let reminderChannelReady = false;

async function ensureAndroidReminderChannel() {
  if (Platform.OS !== 'android' || reminderChannelReady) return;
  await Notifications.setNotificationChannelAsync(REMINDER_CHANNEL_ID, {
    name: 'Reminders',
    importance: Notifications.AndroidImportance.HIGH,
  });
  reminderChannelReady = true;
}

function reminderNotificationId(reminderId: string, dayIndex: number): string {
  return `reminder-${reminderId}-day-${dayIndex}`;
}

/** The app's day indices are 0 = Monday ... 6 = Sunday; expo-notifications' weekday is 1 = Sunday ... 7 = Saturday. */
function toExpoWeekday(dayIndex: number): number {
  return ((dayIndex + 1) % 7) + 1;
}

/**
 * Schedules one repeating weekly notification per selected day and cancels the slot for
 * any day that isn't selected (or all seven, if the reminder itself is disabled). Safe to
 * call repeatedly with the reminder's current shape — each of the 7 day-slots is derived
 * deterministically from `reminder.id`, so this self-corrects drift instead of needing to
 * diff against whatever was previously scheduled.
 */
export async function syncReminderNotifications(
  reminder: { id: string; hour: number; minute: number; days: boolean[]; enabled: boolean },
  content: { title: string; body: string },
): Promise<void> {
  if (!reminder.enabled) {
    await cancelReminderNotifications(reminder.id);
    return;
  }

  const granted = await requestNotificationPermissions();
  if (!granted) return;
  await ensureAndroidReminderChannel();

  await Promise.all(
    reminder.days.map((isOn, dayIndex) => {
      const identifier = reminderNotificationId(reminder.id, dayIndex);
      if (!isOn) return cancelScheduledNotification(identifier);
      return Notifications.scheduleNotificationAsync({
        identifier,
        content: { ...content, sound: 'default' },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
          weekday: toExpoWeekday(dayIndex),
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: REMINDER_CHANNEL_ID,
        },
      });
    }),
  );
}

export async function cancelReminderNotifications(reminderId: string): Promise<void> {
  await Promise.all(
    Array.from({ length: 7 }, (_, dayIndex) =>
      cancelScheduledNotification(reminderNotificationId(reminderId, dayIndex)),
    ),
  );
}
