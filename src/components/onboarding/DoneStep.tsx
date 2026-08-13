import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, withRepeat, withTiming } from 'react-native-reanimated';
import { PineGlyph } from '@/components/PineGlyph';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';
import type { ThemePreference, WeeklyGoal } from '@/store/useAppStore';

export function DoneStep({
  colors,
  name,
  weeklyGoal,
  theme,
}: {
  colors: ColorTokens;
  name: string;
  weeklyGoal: WeeklyGoal;
  theme: ThemePreference;
}) {
  const reducedMotion = useReducedMotion();

  const pulse = useAnimatedStyle(() => ({
    transform: [
      {
        scale: reducedMotion
          ? 1
          : withRepeat(
              withTiming(1.08, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
              -1,
              true,
            ),
      },
    ],
  }));

  const greetingName = name.trim() || 'friend';

  return (
    <View style={styles.container}>
      <View style={styles.stack}>
        <Animated.View style={[styles.glow, { backgroundColor: colors.accent }, pulse]} />
        <PineGlyph width={40} height={54} color={colors.ink} />
      </View>
      <Text style={[styles.headline, { color: colors.ink }]}>All set, {greetingName}.</Text>
      <Text style={[styles.summary, { color: colors.muted }]}>
        {weeklyGoal} days a week, {theme} appearance.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
  },
  stack: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.5,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 36,
    textAlign: 'center',
  },
  summary: {
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    textAlign: 'center',
  },
});
