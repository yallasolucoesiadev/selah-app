import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { animation } from '@/constants/animations';
import { useTheme } from '@/hooks/useTheme';

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}

/** Entrada suave (fade + leve deslize). Respeita "reduzir movimento". */
export function FadeIn({ children, delay = 0, style }: FadeInProps) {
  const { reduceMotion } = useTheme();
  if (reduceMotion) return <View style={style}>{children}</View>;
  return (
    <Animated.View entering={FadeInDown.duration(animation.base).delay(delay)} style={style}>
      {children}
    </Animated.View>
  );
}
