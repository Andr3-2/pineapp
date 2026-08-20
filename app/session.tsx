import { useEffect, useRef } from 'react';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { StatusBar } from 'expo-status-bar';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { PillButton } from '@/components/PillButton';
import { BreathingGlow } from '@/components/session/BreathingGlow';
import { DurationCard } from '@/components/session/DurationCard';
import { Forest } from '@/components/session/Forest';
import { useSessionTimer } from '@/hooks/useSessionTimer';
import { disableDoNotDisturb, enableDoNotDisturb, isDndPermissionGranted, openDndPermissionSettings } from '@/lib/dnd';
import { cancelScheduledNotification, scheduleSessionCompleteNotification } from '@/lib/notifications';
import { useAmbientLoop, useCompletionChime } from '@/lib/sound';
import { useAppStore, type SessionDuration } from '@/store/useAppStore';
import { fonts, sessionUi } from '@/theme/tokens';

const KEEP_AWAKE_TAG = 'pine-session-screen';

const DURATIONS: SessionDuration[] = [1, 5, 10, 30];

function CheckIcon() {
  return (
    <Svg width={14} height={11} viewBox="0 0 14 11">
      <Path d="M1 5.5 L5 10 L13 1" stroke={sessionUi.ink} strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function BackIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14">
      <Path
        d="M8 3 L4 7 L8 11"
        stroke={sessionUi.ink}
        strokeWidth={1.8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function SessionScreen() {
  const isRunning = useAppStore((s) => s.isRunning);
  const justFinished = useAppStore((s) => s.justFinished);
  const sessionStartedAt = useAppStore((s) => s.sessionStartedAt);
  const sessionDurationSeconds = useAppStore((s) => s.sessionDurationSeconds);
  const selectedDuration = useAppStore((s) => s.selectedDuration);
  const setSelectedDuration = useAppStore((s) => s.setSelectedDuration);
  const startSession = useAppStore((s) => s.startSession);
  const endSessionEarly = useAppStore((s) => s.endSessionEarly);
  const dismissJustFinished = useAppStore((s) => s.dismissJustFinished);

  const { formatted, remainingSeconds } = useSessionTimer();

  useAmbientLoop(isRunning, remainingSeconds);
  const playChime = useCompletionChime();
  const wasJustFinished = useRef(justFinished);

  // A local timer that finishes while the app is foregrounded already reflects the
  // completion in state; this notification exists purely to cover the app being
  // backgrounded, so it's always safe to cancel once isRunning flips back to false.
  const notificationId = useRef<string | null>(null);
  useEffect(() => {
    if (!isRunning) return;
    let cancelled = false;
    scheduleSessionCompleteNotification(sessionDurationSeconds).then((id) => {
      if (!cancelled) notificationId.current = id;
    });
    return () => {
      cancelled = true;
      cancelScheduledNotification(notificationId.current);
      notificationId.current = null;
    };
  }, [isRunning, sessionStartedAt, sessionDurationSeconds]);

  useEffect(() => {
    if (justFinished && !wasJustFinished.current) playChime();
    wasJustFinished.current = justFinished;
  }, [justFinished, playChime]);

  useEffect(() => {
    return () => dismissJustFinished();
  }, [dismissJustFinished]);

  // Keep the screen from sleeping for as long as the session screen is on-screen,
  // not just while a countdown is actively running.
  useKeepAwake(KEEP_AWAKE_TAG);

  const dndPromptDismissed = useAppStore((s) => s.dndPromptDismissed);
  const setDndPromptDismissed = useAppStore((s) => s.setDndPromptDismissed);
  useEffect(() => {
    let cancelled = false;
    isDndPermissionGranted().then((granted) => {
      if (cancelled) return;
      if (granted) {
        enableDoNotDisturb();
      } else if (!dndPromptDismissed) {
        setDndPromptDismissed(true);
        Alert.alert(
          'Do Not Disturb',
          'Let Pine silence interruptions while you meditate? You can grant this from your phone settings.',
          [
            { text: 'Not now', style: 'cancel' },
            { text: 'Open settings', onPress: openDndPermissionSettings },
          ],
        );
      }
    });
    return () => {
      cancelled = true;
      disableDoNotDisturb();
    };
  }, []);

  const kicker = isRunning ? 'BREATHE' : justFinished ? 'SESSION COMPLETE' : 'GUIDED SESSION';
  const title = isRunning ? 'Stay with it' : justFinished ? 'Well done' : 'How long today?';

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Forest />
      <BreathingGlow isRunning={isRunning} />

      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <View style={styles.topSection}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
              <BackIcon />
            </Pressable>

            <View style={styles.headerBlock}>
              <Text style={styles.kicker}>{kicker}</Text>
              <Text style={styles.title}>{title}</Text>
            </View>
          </View>

          {!isRunning && justFinished && (
            <View style={styles.idleArea}>
              <View style={styles.toast}>
                <CheckIcon />
                <Text style={styles.toastLabel}>Today is marked on your calendar.</Text>
              </View>

              <PillButton
                label="Done"
                onPress={() => {
                  dismissJustFinished();
                  router.back();
                }}
                height={60}
                backgroundColor={sessionUi.ink}
                pressedBackgroundColor="#FFFFFF"
                textColor={sessionUi.onInk}
              />
            </View>
          )}

          {!isRunning && !justFinished && (
            <View style={styles.idleArea}>
              <View style={styles.durationRow}>
                {DURATIONS.map((minutes) => (
                  <DurationCard
                    key={minutes}
                    minutes={minutes}
                    selected={minutes === selectedDuration}
                    onPress={() => setSelectedDuration(minutes)}
                  />
                ))}
              </View>

              <PillButton
                label="Start"
                onPress={() => startSession()}
                height={60}
                backgroundColor={sessionUi.ink}
                pressedBackgroundColor="#FFFFFF"
                textColor={sessionUi.onInk}
              />
            </View>
          )}

          {isRunning && (
            <View style={styles.runningArea}>
              <Text style={styles.countdown}>{formatted}</Text>
              <PillButton
                label="End session"
                onPress={() => {
                  endSessionEarly();
                  router.back();
                }}
                height={54}
                fullWidth={false}
                paddingHorizontal={34}
                backgroundColor={sessionUi.ghostBg}
                borderColor={sessionUi.ghostBorder}
                textColor={sessionUi.ink}
                blur
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0B2018',
  },
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 46,
    justifyContent: 'space-between',
  },
  topSection: {
    gap: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: sessionUi.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerBlock: {
    alignItems: 'center',
    gap: 8,
  },
  kicker: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    letterSpacing: 2,
    color: 'rgba(214,232,206,0.6)',
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: fonts.serif,
    fontSize: 40,
    color: sessionUi.ink,
    textAlign: 'center',
  },
  idleArea: {
    gap: 16,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 18,
    backgroundColor: sessionUi.toastBg,
  },
  toastLabel: {
    fontFamily: fonts.sansRegular,
    fontSize: 14,
    color: sessionUi.ink,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 10,
  },
  runningArea: {
    alignItems: 'center',
    gap: 40,
  },
  countdown: {
    fontFamily: fonts.serif,
    fontSize: 76,
    letterSpacing: 1,
    color: sessionUi.ink,
  },
});
