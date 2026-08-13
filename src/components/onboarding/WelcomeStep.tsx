import { StyleSheet, Text, View } from 'react-native';
import { PineGlyph } from '@/components/PineGlyph';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

export function WelcomeStep({ colors }: { colors: ColorTokens }) {
  return (
    <View style={styles.container}>
      <View style={[styles.circle, { borderColor: colors.ink }]}>
        <PineGlyph width={22} height={30} color={colors.ink} />
      </View>
      <Text style={[styles.headline, { color: colors.ink }]}>Welcome to Pine</Text>
      <Text style={[styles.body, { color: colors.muted }]}>
        A quiet place to sit, breathe and keep count of the days you showed up.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 22,
  },
  circle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 44,
    lineHeight: 44 * 1.05,
  },
  body: {
    fontFamily: fonts.sansRegular,
    fontSize: 16,
    lineHeight: 16 * 1.55,
    maxWidth: 260,
  },
});
