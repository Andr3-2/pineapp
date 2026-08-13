import { StyleSheet, Text, View } from 'react-native';
import { ThemePicker } from '@/components/ThemePicker';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';
import type { ThemePreference } from '@/store/useAppStore';

export function AppearanceStep({
  colors,
  theme,
  onChangeTheme,
}: {
  colors: ColorTokens;
  theme: ThemePreference;
  onChangeTheme: (theme: ThemePreference) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={[styles.headline, { color: colors.ink }]}>Pick your appearance</Text>
      <ThemePicker colors={colors} theme={theme} onChangeTheme={onChangeTheme} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 22,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 34 * 1.1,
  },
});
