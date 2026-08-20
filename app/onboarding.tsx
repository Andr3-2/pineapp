import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PillButton } from '@/components/PillButton';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { NameStep } from '@/components/onboarding/NameStep';
import { GoalStep } from '@/components/onboarding/GoalStep';
import { AppearanceStep } from '@/components/onboarding/AppearanceStep';
import { DoneStep } from '@/components/onboarding/DoneStep';
import { useTheme } from '@/theme/useTheme';
import { useAppStore } from '@/store/useAppStore';
import { fonts } from '@/theme/tokens';
import { SetFirstAlarm } from '@/components/onboarding/SetFirstAlarm';
import { reminderNotificationContent, syncReminderNotifications } from '@/lib/notifications';


export default function OnboardingScreen() {
  const { colors, scheme } = useTheme();
  const [step, setStep] = useState(0);
  const isLastStep = step === 5;
  const label = useMemo(() => { if (isLastStep) { return "Let's start"; } else if (step === 0) { return "Get started"; } else return "Continue"; }, [step, isLastStep]);

  const name = useAppStore((s) => s.name);
  const setName = useAppStore((s) => s.setName);
  const weeklyGoal = useAppStore((s) => s.weeklyGoal);
  const setWeeklyGoal = useAppStore((s) => s.setWeeklyGoal);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);
  const addReminder = useAppStore((s) => s.addReminder);
  const selectedDuration = useAppStore((s) => s.selectedDuration);

  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDraft, setReminderDraft] = useState({
    hour: 7,
    minute: 0,
    days: [true, true, true, true, true, false, false],
  });

  const stepReminderHour = (delta: number) =>
    setReminderDraft((d) => ({ ...d, hour: ((d.hour + delta) % 24 + 24) % 24 }));
  const stepReminderMinute = (delta: number) =>
    setReminderDraft((d) => ({ ...d, minute: ((d.minute + delta) % 60 + 60) % 60 }));
  const toggleReminderDay = (index: number) =>
    setReminderDraft((d) => ({ ...d, days: d.days.map((v, i) => (i === index ? !v : v)) }));

  const onPrimary = () => {
    if (isLastStep) {
      if (reminderEnabled) {
        const created = addReminder(reminderDraft);
        if (created) syncReminderNotifications(created, reminderNotificationContent(selectedDuration));
      }
      completeOnboarding();
      router.replace('/');
      return;
    }
    setStep((s) => s + 1);
  };

  const onBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]} edges={['top', 'bottom']}>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <ProgressBar step={step} colors={colors} />

          <View style={styles.stepArea}>
            {step === 0 && <WelcomeStep colors={colors} />}
            {step === 1 && <NameStep colors={colors} name={name} onChangeName={setName} />}
            {step === 2 && (
              <GoalStep colors={colors} goal={weeklyGoal} onChangeGoal={setWeeklyGoal} />
            )}
            {step === 3 && (
              <SetFirstAlarm
                colors={colors}
                enabled={reminderEnabled}
                onChangeEnabled={setReminderEnabled}
                hour={reminderDraft.hour}
                minute={reminderDraft.minute}
                days={reminderDraft.days}
                onStepHour={stepReminderHour}
                onStepMinute={stepReminderMinute}
                onToggleDay={toggleReminderDay}
              />
            )}
            {step === 4 && (
              <AppearanceStep colors={colors} theme={theme} onChangeTheme={setTheme} />
            )}
            {step === 5 && (
              <DoneStep colors={colors} name={name} weeklyGoal={weeklyGoal} theme={theme} />
            )}
          </View>

          <View style={styles.footer}>
            <PillButton
              label={label}
              onPress={onPrimary}
              height={58}
              backgroundColor={colors.fill}
              pressedBackgroundColor="#1E5B3F"
              textColor={colors.onFill}
            />
            {step > 0 && (
              <Pressable onPress={onBack} style={styles.backButton}>
                <Text style={[styles.backLabel, { color: colors.muted }]}>Back</Text>
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 30,
    paddingBottom: 16,
  },
  stepArea: {
    flex: 1,
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  backButton: {
    paddingVertical: 4,
  },
  backLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
  },
});
