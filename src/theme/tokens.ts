// Design tokens transcribed from design_handoff_pine_meditation/README.md — authoritative source.

export type ColorScheme = 'light' | 'dark';

export interface ColorTokens {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  fill: string;
  onFill: string;
  onFillSoft: string;
  line: string;
  lineStrong: string;
  tint: string;
}

export const lightColors: ColorTokens = {
  bg: '#F4F2EA',
  ink: '#14352A',
  muted: '#6E7F72',
  accent: '#2C7A56',
  fill: '#14352A',
  onFill: '#F4F2EA',
  onFillSoft: 'rgba(244,242,234,0.65)',
  line: 'rgba(20,53,42,0.14)',
  lineStrong: 'rgba(20,53,42,0.3)',
  tint: 'rgba(20,53,42,0.06)',
};

export const darkColors: ColorTokens = {
  bg: '#0E1F19',
  ink: '#E7EFE6',
  muted: '#8AA396',
  accent: '#4E9C74',
  fill: '#2C7A56',
  onFill: '#F1F7EE',
  onFillSoft: 'rgba(241,247,238,0.7)',
  line: 'rgba(231,239,230,0.18)',
  lineStrong: 'rgba(231,239,230,0.4)',
  tint: 'rgba(231,239,230,0.07)',
};

export const colorsByScheme: Record<ColorScheme, ColorTokens> = {
  light: lightColors,
  dark: darkColors,
};

// Fixed forest palette — not themed, used only on the always-dark session screen.
export const forest = {
  skyGradient: ['#0B2018', '#123528', '#1A4634', '#16382A'] as const,
  skyGradientLocations: [0, 0.45, 0.72, 1] as const,
  hill: '#14352A',
  groundGradient: ['#123024', '#0A1C14'] as const,
  groundSeam: 'rgba(74,50,38,0.6)',
  near: {
    trunk: '#4A3226',
    canopy: ['#1B4A36', '#205742', '#24634A'] as const,
    opacity: 1,
  },
  mid: {
    trunk: '#43301F',
    canopy: ['#226046', '#256B4E', '#2A7455'] as const,
    opacity: 0.75,
  },
  mist: '#16382A',
  glowIdle: 'rgba(163,196,124,0.28)',
  glowRunning: 'rgba(163,196,124,0.42)',
  foregroundInk: '#F4F2EA',
  kickerInk: 'rgba(214,232,206,0.6)',
};

// Fixed chrome for the always-dark session screen (glass cards, ghost button, toast).
export const sessionUi = {
  ink: '#F4F2EA',
  onInk: '#14352A',
  glassBg: 'rgba(11,32,24,0.3)',
  glassBorder: 'rgba(244,242,234,0.28)',
  glassBorderHover: 'rgba(244,242,234,0.7)',
  toastBg: 'rgba(244,242,234,0.14)',
  ghostBorder: 'rgba(244,242,234,0.4)',
  ghostBg: 'rgba(11,32,24,0.35)',
};

export const spacing = {
  xs: 4,
  sm: 6,
  smd: 10,
  md: 12,
  mdl: 14,
  lg: 16,
  lgl: 18,
  xl: 20,
  xxl: 22,
  xxxl: 26,
  section: 30,
  footer: 40,
  screenBottom: 46,
  screenTop: 74,
};

export const radii = {
  dayCell: 13,
  card: 18,
  cardLg: 20,
  optionCard: 22,
  pill: 999,
  circle: 9999,
};

export const controlHeights = {
  chevron: 30,
  dayCell: 42,
  ghostButton: 54,
  primaryButton: 58,
  primaryButtonLg: 60,
  durationCard: 76,
  goalCell: 64,
};

// Instrument Serif — display/numerals.
export const serifSizes = {
  session76: 76,
  onboarding44: 44,
  session40: 40,
  onboardingDone36: 36,
  onboardingName34: 34,
  trackerWelcome34: 34,
  trackerStat32: 32,
  sessionDuration28: 28,
};

// DM Sans — UI text.
export const sansSizes = {
  input22: 22,
  goalOption20: 20,
  primaryButton17: 17,
  startButton17: 17,
  onboardingDoneBody16: 16,
  onboardingBody16: 16,
  helper15: 15,
  appearanceTitle: 17,
  helper14: 14,
  toast14: 14,
  statLabel12: 12,
  minutesLabel12: 12,
  kickerTracker13: 13,
  appearanceNote13: 13,
  helper13: 13,
  dayNumber13: 13,
  dayNumberCompleted: 12,
  kickerSession12: 12,
  dayGridWeekday: 11,
};

export const fonts = {
  serif: 'InstrumentSerif_400Regular',
  sansRegular: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansSemiBold: 'DMSans_600SemiBold',
  sansBold: 'DMSans_700Bold',
  sansLight: 'DMSans_300Light',
};
