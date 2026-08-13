import { BlurView } from 'expo-blur';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts, sessionUi } from '@/theme/tokens';
import type { SessionDuration } from '@/store/useAppStore';

export function DurationCard({
  minutes,
  selected,
  onPress,
}: {
  minutes: SessionDuration;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        selected
          ? { backgroundColor: sessionUi.ink }
          : { borderWidth: 1, borderColor: sessionUi.glassBorder },
      ]}
    >
      {!selected && (
        <BlurView intensity={6} tint="dark" style={StyleSheet.absoluteFill} />
      )}
      <Text key={`numeral-${selected}`} style={[styles.numeral, { color: selected ? sessionUi.onInk : sessionUi.ink }]}>
        {minutes}
      </Text>
      <Text key={`label-${selected}`} style={[styles.label, { color: selected ? sessionUi.onInk : sessionUi.ink }]}>
        minutes
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 76,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    //overflow: 'hidden',
  },
  numeral: {
    fontFamily: fonts.serif,
    fontSize: 28,
  },
  label: {
    fontFamily: fonts.sansRegular,
    fontSize: 12,
  },
});
