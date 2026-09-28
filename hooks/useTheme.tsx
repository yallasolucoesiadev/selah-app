import { useEffect, useMemo, useState } from 'react';
import { AccessibilityInfo, useColorScheme } from 'react-native';

import { darkColors, lightColors, Palette } from '@/constants/colors';
import { softShadow } from '@/constants/shadows';
import { usePrefs } from './usePrefs';

export interface Theme {
  colors: Palette;
  isDark: boolean;
  fontScale: number;
  reduceMotion: boolean;
  shadow: (level?: 1 | 2) => ReturnType<typeof softShadow>;
}

/** Detecta a preferência de "reduzir movimento" do sistema. */
export function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    let active = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => active && setReduce(value))
      .catch(() => undefined);
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduce);
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  return reduce;
}

export function useTheme(): Theme {
  const { prefs } = usePrefs();
  const system = useColorScheme();
  const reduceMotion = useReduceMotion();

  const isDark = prefs.mode === 'system' ? system === 'dark' : prefs.mode === 'dark';

  return useMemo(
    () => ({
      colors: isDark ? darkColors : lightColors,
      isDark,
      fontScale: prefs.fontScale,
      reduceMotion,
      shadow: (level: 1 | 2 = 1) => softShadow(isDark, level),
    }),
    [isDark, prefs.fontScale, reduceMotion],
  );
}
