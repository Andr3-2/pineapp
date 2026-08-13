import { StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

export function StatCard({
  value,
  label,
  filled,
  colors,
}: {
  value: number;
  label: string;
  filled?: boolean;
  colors: ColorTokens;
}) {
  return (
    <View
      style={[
        styles.card,
        filled
          ? { backgroundColor: colors.fill }
          : { borderWidth: 1, borderColor: colors.line },
      ]}
    >
      <Text style={[styles.value, { color: filled ? colors.onFill : colors.ink }]}>{value}</Text>
      <Text style={[styles.label, { color: filled ? colors.onFillSoft : colors.muted }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    gap: 4,
  },
  value: {
    fontFamily: fonts.serif,
    fontSize: 32,
    lineHeight: 32,
  },
  label: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
  },
});
