import { StyleSheet, Text, View } from 'react-native';
import { DayGrid } from '@/components/reminders/DayGrid';
import { ReminderSwitch } from '@/components/reminders/ReminderSwitch';
import { TimeStepper } from '@/components/reminders/TimeStepper';
import { describeRepeatDays } from '@/lib/date';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

export function SetFirstAlarm({
  colors,
  enabled,
  onChangeEnabled,
  hour,
  minute,
  days,
  onStepHour,
  onStepMinute,
  onToggleDay,
}: {
  colors: ColorTokens;
  enabled: boolean;
  onChangeEnabled: (enabled: boolean) => void;
  hour: number;
  minute: number;
  days: boolean[];
  onStepHour: (delta: number) => void;
  onStepMinute: (delta: number) => void;
  onToggleDay: (index: number) => void;
}) {
  return (
    <View style={styles.container}>
      <View>
        <View style={styles.headlineRow}>
          <Text style={[styles.headline, { color: colors.ink }]}>Set your first reminder</Text>
          <ReminderSwitch enabled={enabled} onToggle={() => onChangeEnabled(!enabled)} colors={colors} />
        </View>
        <Text style={[styles.helper, { color: colors.muted }]}>
          A gentle nudge to breathe. You can change it or add more later from the bell icon.
        </Text>
      </View>

      <View style={!enabled && styles.disabled} pointerEvents={enabled ? 'auto' : 'none'}>
        <View style={styles.pickerGroup}>
          <TimeStepper hour={hour} minute={minute} onStepHour={onStepHour} onStepMinute={onStepMinute} colors={colors} />
          <View style={styles.repeatSection}>
            <DayGrid days={days} onToggleDay={onToggleDay} colors={colors} />
            <Text style={[styles.repeatSummary, { color: colors.muted }]}>{describeRepeatDays(days)}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 26,
  },
  headlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 34 * 1.1,
    flexShrink: 1,
  },
  helper: {
    fontFamily: fonts.sansRegular,
    fontSize: 15,
    marginTop: 10,
  },
  disabled: {
    opacity: 0.4,
  },
  pickerGroup: {
    gap: 26,
  },
  repeatSection: {
    gap: 12,
  },
  repeatSummary: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
});
