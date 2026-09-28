import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { animation } from '@/constants/animations';
import { useTheme } from '@/hooks/useTheme';

interface ProgressBarProps {
  /** 0..1 */
  value: number;
  height?: number;
  label?: string;
}

export function ProgressBar({ value, height = 8, label }: ProgressBarProps) {
  const { colors, reduceMotion } = useTheme();
  const progress = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, value));

  useEffect(() => {
    progress.value = reduceMotion ? clamped : withTiming(clamped, { duration: animation.slow, easing: Easing.out(Easing.cubic) });
  }, [clamped, progress, reduceMotion]);

  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label ?? 'Progresso'}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={{ height, borderRadius: height, backgroundColor: colors.surfaceAlt, overflow: 'hidden' }}
    >
      <Animated.View style={[{ height, borderRadius: height, backgroundColor: colors.gold }, fill]} />
    </View>
  );
}
