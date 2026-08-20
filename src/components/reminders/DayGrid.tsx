import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { weekdayHeaderLabels } from '@/lib/date';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

export function DayGrid({
  days,
  onToggleDay,
  colors,
}: {
  days: boolean[];
  onToggleDay: (index: number) => void;
  colors: ColorTokens;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const cellWidth = containerWidth > 0 ? (containerWidth - 6 * 6) / 7 : 0;

  return (
    <View style={styles.grid} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {weekdayHeaderLabels.map((label, i) => {
        const selected = days[i];
        return (
          <Pressable
            key={i}
            onPress={() => onToggleDay(i)}
            hitSlop={4}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={label}
            style={[
              styles.cell,
              { width: cellWidth || undefined },
              selected
                ? { backgroundColor: colors.fill, borderWidth: 0 }
                : { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.line },
            ]}
          >
            <Text
              style={[
                styles.cellLabel,
                { color: selected ? colors.onFill : colors.ink, fontWeight: selected ? '500' : '400' },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 6,
  },
  cell: {
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
  },
});
