import { useColorScheme } from 'react-native';
import { useAppStore } from '@/store/useAppStore';
import { colorsByScheme, type ColorScheme, type ColorTokens } from './tokens';

export interface ResolvedTheme {
  scheme: ColorScheme;
  colors: ColorTokens;
}

/** Resolves the user's theme preference ('light' | 'dark' | 'device') into concrete tokens. */
export function useTheme(): ResolvedTheme {
  const preference = useAppStore((s) => s.theme);
  const deviceScheme = useColorScheme();

  const scheme: ColorScheme =
    preference === 'device' ? (deviceScheme === 'dark' ? 'dark' : 'light') : preference;

  return { scheme, colors: colorsByScheme[scheme] };
}
