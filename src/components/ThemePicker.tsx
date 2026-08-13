import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';
import type { ThemePreference } from '@/store/useAppStore';

const ROWS: { value: ThemePreference; title: string; note: string }[] = [
  { value: 'dark', title: 'Dark', note: 'Deep forest at night' },
  { value: 'light', title: 'Light', note: 'Soft paper and moss' },
  { value: 'device', title: 'Use device setting', note: 'Follows your system' },
];

export function ThemePicker({
  colors,
  theme,
  onChangeTheme,
}: {
  colors: ColorTokens;
  theme: ThemePreference;
  onChangeTheme: (theme: ThemePreference) => void;
}) {
  return (
    <View style={styles.rows}>
      {ROWS.map((row) => {
        const selected = row.value === theme;
        return (
          <Pressable
            key={row.value}
            onPress={() => onChangeTheme(row.value)}
            style={[
              styles.row,
              {
                borderWidth: selected ? 1.5 : 1,
                borderColor: selected ? colors.ink : colors.line,
                backgroundColor: selected ? colors.tint : 'transparent',
              },
            ]}
          >
            <View
              style={[
                styles.dot,
                {
                  borderWidth: selected ? 5 : 1.5,
                  borderColor: selected ? colors.ink : colors.lineStrong,
                },
              ]}
            />
            <View style={styles.textWrap}>
              <Text style={[styles.title, { color: colors.ink }]}>{row.title}</Text>
              <Text style={[styles.note, { color: colors.muted }]}>{row.note}</Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rows: {
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: 18,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  textWrap: {
    gap: 2,
  },
  title: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
  },
  note: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
});
