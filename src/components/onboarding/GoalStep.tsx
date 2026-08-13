import { StyleSheet, Text, View } from 'react-native';
import { GoalPicker } from '@/components/GoalPicker';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';
import type { WeeklyGoal } from '@/store/useAppStore';

function helperCopy(goal: WeeklyGoal): string {
  if (goal >= 6) return 'Ambitious. We will keep the sessions short.';
  if (goal >= 4) return 'A steady rhythm, easy to keep.';
  return 'Gentle start. You can raise it later.';
}

export function GoalStep({
  colors,
  goal,
  onChangeGoal,
}: {
  colors: ColorTokens;
  goal: WeeklyGoal;
  onChangeGoal: (goal: WeeklyGoal) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={[styles.headline, { color: colors.ink }]}>How many days a week?</Text>
      <GoalPicker colors={colors} goal={goal} onChangeGoal={onChangeGoal} />
      <Text style={[styles.helper, { color: colors.muted }]}>{helperCopy(goal)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 34 * 1.1,
  },
  helper: {
    fontFamily: fonts.sansRegular,
    fontSize: 15,
  },
});
