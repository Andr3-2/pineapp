import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

function ChevronUpIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={8} viewBox="0 0 14 8">
      <Path d="M1 7 L7 1 L13 7" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChevronDownIcon({ color }: { color: string }) {
  return (
    <Svg width={14} height={8} viewBox="0 0 14 8">
      <Path d="M1 1 L7 7 L13 1" stroke={color} strokeWidth={1.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function StepperColumn({
  value,
  label,
  onIncrement,
  onDecrement,
  colors,
}: {
  value: number;
  label: string;
  onIncrement: () => void;
  onDecrement: () => void;
  colors: ColorTokens;
}) {
  return (
    <View style={styles.column}>
      <Pressable onPress={onIncrement} hitSlop={8} accessibilityLabel={`${label} up`} style={styles.button}>
        <ChevronUpIcon color={colors.muted} />
      </Pressable>
      <Text style={[styles.value, { color: colors.ink }]}>{String(value).padStart(2, '0')}</Text>
      <Pressable onPress={onDecrement} hitSlop={8} accessibilityLabel={`${label} down`} style={styles.button}>
        <ChevronDownIcon color={colors.muted} />
      </Pressable>
    </View>
  );
}

export function TimeStepper({
  hour,
  minute,
  onStepHour,
  onStepMinute,
  colors,
}: {
  hour: number;
  minute: number;
  onStepHour: (delta: number) => void;
  onStepMinute: (delta: number) => void;
  colors: ColorTokens;
}) {
  return (
    <View style={[styles.block, { borderColor: colors.line }]}>
      <StepperColumn
        value={hour}
        label="Hour"
        onIncrement={() => onStepHour(1)}
        onDecrement={() => onStepHour(-1)}
        colors={colors}
      />
      <Text style={[styles.colon, { color: colors.muted }]}>:</Text>
      <StepperColumn
        value={minute}
        label="Minutes"
        onIncrement={() => onStepMinute(5)}
        onDecrement={() => onStepMinute(-5)}
        colors={colors}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    borderWidth: 1,
    borderRadius: 22,
    paddingVertical: 22,
  },
  column: {
    alignItems: 'center',
    gap: 8,
  },
  button: {
    width: 34,
    height: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontFamily: fonts.serif,
    fontSize: 58,
  },
  colon: {
    fontFamily: fonts.serif,
    fontSize: 46,
  },
});
