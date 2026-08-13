import { useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';
import type { WeeklyGoal } from '@/store/useAppStore';

const OPTIONS: WeeklyGoal[] = [1, 2, 3, 4, 5, 6, 7];
const COLUMNS = 4;
const GAP = 12;

export function GoalPicker({
  colors,
  goal,
  onChangeGoal,
}: {
  colors: ColorTokens;
  goal: WeeklyGoal;
  onChangeGoal: (goal: WeeklyGoal) => void;
}) {
  const [containerWidth, setContainerWidth] = useState(0);
  const cellWidth = containerWidth > 0 ? (containerWidth - GAP * (COLUMNS - 1)) / COLUMNS : 0;

  const onLayout = (e: LayoutChangeEvent) => setContainerWidth(e.nativeEvent.layout.width);

  return (
    <View style={styles.grid} onLayout={onLayout}>
      {OPTIONS.map((n) => {
        const selected = n === goal;
        return (
          <Pressable
            key={n}
            onPress={() => onChangeGoal(n)}
            style={[
              styles.cell,
              {
                width: cellWidth || undefined,
                backgroundColor: selected ? colors.fill : 'transparent',
                borderWidth: selected ? 0 : 1,
                borderColor: colors.line,
              },
            ]}
          >
            <Text
              style={[
                styles.label,
                { color: selected ? colors.onFill : colors.ink, fontWeight: selected ? '500' : '400' },
              ]}
            >
              {n}
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
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: fonts.sansRegular,
    fontSize: 20,
  },
});
