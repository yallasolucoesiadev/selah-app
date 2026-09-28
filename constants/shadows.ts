import { Platform, ViewStyle } from 'react-native';

/** Sombras suaves e quentes (nunca pretas puras). */
export function softShadow(isDark: boolean, level: 1 | 2 = 1): ViewStyle {
  if (isDark) return { borderWidth: 1 };
  const opacity = level === 1 ? 0.07 : 0.12;
  const blur = level === 1 ? 14 : 24;
  const offset = level === 1 ? 4 : 10;
  return Platform.select<ViewStyle>({
    ios: {
      shadowColor: '#6B4A2B',
      shadowOpacity: opacity,
      shadowRadius: blur,
      shadowOffset: { width: 0, height: offset },
    },
    android: { elevation: level === 1 ? 2 : 5, shadowColor: '#6B4A2B' },
    default: { boxShadow: `0px ${offset}px ${blur}px rgba(107, 74, 43, ${opacity})` } as ViewStyle,
  }) as ViewStyle;
}
