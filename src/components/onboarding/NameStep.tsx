import { StyleSheet, Text, TextInput, View } from 'react-native';
import { fonts } from '@/theme/tokens';
import type { ColorTokens } from '@/theme/tokens';

export function NameStep({
  colors,
  name,
  onChangeName,
}: {
  colors: ColorTokens;
  name: string;
  onChangeName: (name: string) => void;
}) {
  return (
    <View style={styles.container}>
      <Text style={[styles.headline, { color: colors.ink }]}>What should we call you?</Text>
      <View style={[styles.fieldWrap, { borderBottomColor: colors.lineStrong }]}>
        <TextInput
          value={name}
          onChangeText={onChangeName}
          placeholder="Your name"
          placeholderTextColor={colors.muted}
          style={[styles.input, { color: colors.ink }]}
          autoCapitalize="words"
          autoCorrect={false}
        />
      </View>
      <Text style={[styles.helper, { color: colors.muted }]}>Only used to greet you.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: 14,
  },
  headline: {
    fontFamily: fonts.serif,
    fontSize: 34,
    lineHeight: 34 * 1.1,
    marginBottom: 8,
  },
  fieldWrap: {
    borderBottomWidth: 1.5,
  },
  input: {
    fontFamily: fonts.sansRegular,
    fontSize: 22,
    paddingVertical: 12,
    paddingHorizontal: 2,
  },
  helper: {
    fontFamily: fonts.sansRegular,
    fontSize: 13,
  },
});
