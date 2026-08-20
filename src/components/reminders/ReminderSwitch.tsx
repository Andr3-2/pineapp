import { Pressable, StyleSheet, View } from 'react-native';
import type { ColorTokens } from '@/theme/tokens';

export function ReminderSwitch({
  enabled,
  onToggle,
  colors,
}: {
  enabled: boolean;
  onToggle: () => void;
  colors: ColorTokens;
}) {
  return (
    <Pressable
      onPress={onToggle}
      hitSlop={8}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
      accessibilityLabel="Enable/Disable reminder"
      style={[
        styles.track,
        enabled
          ? { backgroundColor: colors.fill, borderWidth: 0 }
          : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
      ]}
    >
      <View
        style={[
          styles.knob,
          enabled ? styles.knobRight : styles.knobLeft,
          { backgroundColor: enabled ? colors.onFill : colors.lineStrong },
        ]}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    padding: 3,
  },
  knob: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  knobLeft: {
    alignSelf: 'flex-start',
  },
  knobRight: {
    alignSelf: 'flex-end',
  },
});
