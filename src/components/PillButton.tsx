import { BlurView } from 'expo-blur';
import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { fonts } from '@/theme/tokens';

interface PillButtonProps {
  label: string;
  onPress: () => void;
  height?: number;
  backgroundColor: string;
  pressedBackgroundColor?: string;
  textColor: string;
  borderColor?: string;
  blur?: boolean;
  icon?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  paddingHorizontal?: number;
}

export function PillButton({
  label,
  onPress,
  height = 58,
  backgroundColor,
  pressedBackgroundColor,
  textColor,
  borderColor,
  blur,
  icon,
  disabled,
  fullWidth = true,
  paddingHorizontal,
}: PillButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        {
          height,
          width: fullWidth ? '100%' : undefined,
          alignSelf: fullWidth ? 'stretch' : 'center',
          paddingHorizontal,
          backgroundColor: pressed ? pressedBackgroundColor ?? backgroundColor : backgroundColor,
          borderColor,
          borderWidth: borderColor ? 1 : 0,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {blur && <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />}
      <View style={styles.content}>
        {icon}
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontFamily: fonts.sansMedium,
    fontSize: 17,
    letterSpacing: 0.2,
  },
});
