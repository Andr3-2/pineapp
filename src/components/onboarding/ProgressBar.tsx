import Animated, { interpolateColor, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { StyleSheet, View } from 'react-native';
import type { ColorTokens } from '@/theme/tokens';

const TOTAL_STEPS = 6;

function Segment({ filled, colors }: { filled: boolean; colors: ColorTokens }) {
  const progress = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      interpolateColor(filled ? 1 : 0, [0, 1], [colors.line, colors.fill]),
      { duration: 300 },
    ),
  }));

  return <Animated.View style={[styles.segment, progress]} />;
}

export function ProgressBar({ step, colors }: { step: number; colors: ColorTokens }) {
  return (
    <View style={styles.row}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <Segment key={i} filled={i <= step} colors={colors} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 40,
  },
  segment: {
    flex: 1,
    height: 3,
    borderRadius: 2,
  },
});
