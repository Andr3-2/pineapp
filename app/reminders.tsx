import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { PillButton } from '@/components/PillButton';
import { DayGrid } from '@/components/reminders/DayGrid';
import { ReminderSwitch } from '@/components/reminders/ReminderSwitch';
import { TimeStepper } from '@/components/reminders/TimeStepper';
import { describeRepeatDays, formatClock } from '@/lib/date';
import {
  cancelReminderNotifications,
  reminderNotificationContent,
  syncReminderNotifications,
} from '@/lib/notifications';
import { MAX_REMINDERS, useAppStore, type Reminder } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

type Draft = { hour: number; minute: number; days: boolean[] };

const DEFAULT_DRAFT: Draft = { hour: 7, minute: 0, days: [true, true, true, true, true, false, false] };
const PRESSED_FILL = '#1E5B3F';

function BackIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M8 3 L4 7 L8 11"
        stroke={color}
        strokeWidth={1.6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ReminderRow({
  reminder,
  colors,
  onPress,
  onToggle,
}: {
  reminder: Reminder;
  colors: ColorTokens;
  onPress: () => void;
  onToggle: () => void;
}) {
  return (
    <View style={[styles.row, { borderColor: colors.line }]}>
      <Pressable onPress={onPress} style={styles.rowLeft}>
        <Text style={[styles.rowTime, { color: reminder.enabled ? colors.ink : colors.muted }]}>
          {formatClock(reminder.hour, reminder.minute)}
        </Text>
        <Text style={[styles.rowSummary, { color: colors.muted }]}>{describeRepeatDays(reminder.days)}</Text>
      </Pressable>
      <ReminderSwitch enabled={reminder.enabled} onToggle={onToggle} colors={colors} />
    </View>
  );
}

export default function RemindersScreen() {
  const { colors, scheme } = useTheme();

  const reminders = useAppStore((s) => s.reminders);
  const addReminder = useAppStore((s) => s.addReminder);
  const updateReminder = useAppStore((s) => s.updateReminder);
  const deleteReminder = useAppStore((s) => s.deleteReminder);
  const setReminderEnabled = useAppStore((s) => s.setReminderEnabled);
  const selectedDuration = useAppStore((s) => s.selectedDuration);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const isEditing = draft !== null;

  // Heal any drift between persisted reminders and the OS notification schedule (e.g.
  // permission was granted later, or a previous scheduling call never got to finish).
  useEffect(() => {
    const content = reminderNotificationContent(selectedDuration);
    reminders.forEach((r) => syncReminderNotifications(r, content));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBack = () => {
    if (isEditing) {
      setDraft(null);
      setEditingId(null);
    } else {
      router.back();
    }
  };

  const handleNew = () => {
    setEditingId(null);
    setDraft({ ...DEFAULT_DRAFT, days: [...DEFAULT_DRAFT.days] });
  };

  const handleOpenEdit = (reminder: Reminder) => {
    setEditingId(reminder.id);
    setDraft({ hour: reminder.hour, minute: reminder.minute, days: [...reminder.days] });
  };

  const stepHour = (delta: number) =>
    setDraft((d) => (d ? { ...d, hour: ((d.hour + delta) % 24 + 24) % 24 } : d));
  const stepMinute = (delta: number) =>
    setDraft((d) => (d ? { ...d, minute: ((d.minute + delta) % 60 + 60) % 60 } : d));
  const toggleDay = (index: number) =>
    setDraft((d) => (d ? { ...d, days: d.days.map((v, i) => (i === index ? !v : v)) } : d));

  const handleToggleEnabled = (reminder: Reminder) => {
    const enabled = !reminder.enabled;
    setReminderEnabled(reminder.id, enabled);
    syncReminderNotifications({ ...reminder, enabled }, reminderNotificationContent(selectedDuration));
  };

  const handleSave = () => {
    if (!draft) return;
    const content = reminderNotificationContent(selectedDuration);
    if (editingId) {
      updateReminder(editingId, draft);
      syncReminderNotifications({ id: editingId, ...draft, enabled: true }, content);
    } else {
      const created = addReminder(draft);
      if (created) syncReminderNotifications(created, content);
    }
    setDraft(null);
    setEditingId(null);
  };

  const handleDelete = () => {
    if (!editingId) return;
    const id = editingId;
    Alert.alert('Delete reminder?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          cancelReminderNotifications(id);
          deleteReminder(id);
          setDraft(null);
          setEditingId(null);
        },
      },
    ]);
  };

  const title = !isEditing ? 'Reminders' : editingId ? 'Edit reminder' : 'New reminder';
  const subtitle = !isEditing
    ? `${reminders.length} of ${MAX_REMINDERS} set`
    : 'Pick a time and the days it repeats';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.content}>
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            accessibilityLabel="Back"
            style={[styles.backButton, { borderColor: colors.line }]}
          >
            <BackIcon color={colors.ink} />
          </Pressable>
          <View style={styles.headerText}>
            <Text style={[styles.title, { color: colors.ink }]}>{title}</Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>{subtitle}</Text>
          </View>
        </View>

        {!isEditing ? (
          <>
            <View style={styles.list}>
              {reminders.map((reminder) => (
                <ReminderRow
                  key={reminder.id}
                  reminder={reminder}
                  colors={colors}
                  onPress={() => handleOpenEdit(reminder)}
                  onToggle={() => handleToggleEnabled(reminder)}
                />
              ))}
            </View>

            {reminders.length < MAX_REMINDERS ? (
              <PillButton
                label="New reminder"
                onPress={handleNew}
                height={60}
                backgroundColor={colors.fill}
                pressedBackgroundColor={PRESSED_FILL}
                textColor={colors.onFill}
              />
            ) : (
              <View style={[styles.maxNotice, { borderColor: colors.line }]}>
                <Text style={[styles.maxNoticeText, { color: colors.muted }]}>Five reminders is the maximum</Text>
              </View>
            )}
          </>
        ) : (
          <>
            <View style={styles.editorBody}>
              <TimeStepper
                hour={draft.hour}
                minute={draft.minute}
                onStepHour={stepHour}
                onStepMinute={stepMinute}
                colors={colors}
              />

              <View style={styles.repeatSection}>
                <Text style={[styles.repeatLabel, { color: colors.muted }]}>REPEAT</Text>
                <DayGrid days={draft.days} onToggleDay={toggleDay} colors={colors} />
                <Text style={[styles.repeatSummary, { color: colors.muted }]}>{describeRepeatDays(draft.days)}</Text>
              </View>
            </View>

            <View style={styles.editorFooter}>
              <PillButton
                label="Save reminder"
                onPress={handleSave}
                height={60}
                backgroundColor={colors.fill}
                pressedBackgroundColor={PRESSED_FILL}
                textColor={colors.onFill}
              />
              <Pressable onPress={editingId ? handleDelete : handleBack} style={styles.textButton}>
                <Text style={[styles.textButtonLabel, { color: colors.muted }]}>
                  {editingId ? 'Delete reminder' : 'Cancel'}
                </Text>
              </Pressable>
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 26,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 24,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    gap: 6,
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 34,
  },
  subtitle: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
  list: {
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  rowLeft: {
    flex: 1,
    gap: 4,
  },
  rowTime: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 34,
  },
  rowSummary: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
  maxNotice: {
    height: 60,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  maxNoticeText: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },
  editorBody: {
    gap: 26,
  },
  repeatSection: {
    gap: 12,
  },
  repeatLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 1.4,
  },
  repeatSummary: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
  editorFooter: {
    gap: 14,
  },
  textButton: {
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButtonLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },
});
