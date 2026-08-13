import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { forest } from '@/theme/tokens';

const IDLE_SIZE = 180;
const RUNNING_SIZE = 220;
const DURATION = 10000;

function Glow({ size, color }: { size: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor={color} stopOpacity={1} />
          <Stop offset="70%" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#glow)" />
    </Svg>
  );
}

/**
 * The idle glow is decorative; the running glow is the breath pacer, so per the
 * handoff it keeps animating even under prefers-reduced-motion (unlike the forest sway/mist).
 */
export function BreathingGlow({ isRunning }: { isRunning: boolean }) {
  const scale = useSharedValue(0.72);

  useEffect(() => {
    if (!isRunning) {
      scale.value = withTiming(1, { duration: 300 });
      return;
    }
    scale.value = 0.72;
    scale.value = withRepeat(
      withSequence(
        withTiming(1.14, { duration: DURATION * 0.4, easing: Easing.inOut(Easing.ease) }),
        withTiming(1.14, { duration: DURATION * 0.15, easing: Easing.linear }),
        withTiming(0.72, { duration: DURATION * 0.45, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
  }, [isRunning, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.wrap, !isRunning && { opacity: 0.7 }, animatedStyle]}>
      <Glow
        size={isRunning ? RUNNING_SIZE : IDLE_SIZE}
        color={isRunning ? forest.glowRunning : forest.glowIdle}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
});
