import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, Path, Polygon, Rect } from 'react-native-svg';
import { PillButton } from '@/components/PillButton';
import { Calendar } from '@/components/tracker/Calendar';
import { StatCard } from '@/components/tracker/StatCard';
import { formatKicker, formatMinutesCalmer, minutesInMonth, monthLabelShort, sessionsInMonth } from '@/lib/date';
import { useAppStore } from '@/store/useAppStore';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/tokens';

function PlayIcon({ color }: { color: string }) {
  return (
    <Svg width={9} height={11} viewBox="0 0 9 11">
      <Polygon points="0,0 9,5.5 0,11" fill={color} />
    </Svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 16 16">
      <Path
        d="M8 2c-2 0-3.2 1.6-3.2 3.6v2.1c0 .5-.2 1-.6 1.4L3 10.5h10l-1.2-1.4a2 2 0 0 1-.6-1.4V5.6C11.2 3.6 10 2 8 2Z"
        stroke={color}
        strokeWidth={1.4}
        fill="none"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <Path d="M6.5 12.5a1.6 1.6 0 0 0 3 0" stroke={color} strokeWidth={1.4} fill="none" strokeLinecap="round" />
    </Svg>
  );
}

function SettingsIcon({ color }: { color: string }) {
  const teeth = Array.from({ length: 8 });
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={2} fill="none" />
      {teeth.map((_, i) => (
        <Rect key={i} x={11} y={1.5} width={2} height={4} rx={1} fill={color} transform={`rotate(${(i * 360) / teeth.length} 12 12)`} />
      ))}
    </Svg>
  );
}

export default function TrackerScreen() {
  const { colors, scheme } = useTheme();

  const onboardingComplete = useAppStore((s) => s.onboardingComplete);
  const name = useAppStore((s) => s.name);
  const weeklyGoal = useAppStore((s) => s.weeklyGoal);
  const completedByMonth = useAppStore((s) => s.completedByMonth);
  const sessions = useAppStore((s) => s.sessions);
  const viewedYear = useAppStore((s) => s.viewedYear);
  const viewedMonth = useAppStore((s) => s.viewedMonth);
  const pageMonth = useAppStore((s) => s.pageMonth);
  const goToCurrentMonth = useAppStore((s) => s.goToCurrentMonth);

  if (!onboardingComplete) {
    return <Redirect href="/onboarding" />;
  }

  const today = new Date();
  const isViewingCurrentMonth = viewedYear === today.getFullYear() && viewedMonth === today.getMonth();
  const viewedMonthShort = monthLabelShort(viewedMonth);
  const minutesInViewedMonth = minutesInMonth(sessions, completedByMonth, viewedYear, viewedMonth);
  const sessionsInViewedMonth = sessionsInMonth(completedByMonth, viewedYear, viewedMonth);
  const calmerLabel = isViewingCurrentMonth ? 'calmer this month' : `calmer in ${viewedMonthShort}`;
  const greetingName = name.trim() || 'friend';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={[styles.kicker, { color: colors.muted }]}>{formatKicker(today).toUpperCase()}</Text>
            <Text style={[styles.welcome, { color: colors.ink }]}>Welcome, {greetingName}</Text>
          </View>
          <View style={styles.headerButtons}>
            <Pressable
              onPress={() => router.push('/reminders')}
              accessibilityLabel="Reminders"
              style={[styles.iconButton, { borderColor: colors.line }]}
            >
              <BellIcon color={colors.ink} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/settings')}
              accessibilityLabel="Settings"
              style={[styles.iconButton, { borderColor: colors.line }]}
            >
              <SettingsIcon color={colors.ink} />
            </Pressable>
          </View>
        </View>

        <View style={styles.statRow}>
          <StatCard value={formatMinutesCalmer(minutesInViewedMonth)} label={calmerLabel} filled colors={colors} />
          <StatCard value={sessionsInViewedMonth} label={`sessions in ${viewedMonthShort}`} colors={colors} />
          <StatCard value={weeklyGoal} label="days a week goal" colors={colors} />
        </View>

        <Calendar
          year={viewedYear}
          month={viewedMonth}
          completedByMonth={completedByMonth}
          today={today}
          onPrevMonth={() => pageMonth(-1)}
          onNextMonth={() => pageMonth(1)}
          onToday={goToCurrentMonth}
          colors={colors}
        />

        <PillButton
          label="Start meditating"
          onPress={() => router.push('/session')}
          height={60}
          backgroundColor={colors.fill}
          pressedBackgroundColor="#1E5B3F"
          textColor={colors.onFill}
        />
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
    paddingBottom: 16,
    gap: 26,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    letterSpacing: 1.4,
  },
  welcome: {
    fontFamily: fonts.serif,
    fontSize: 34,
  },
  statRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
