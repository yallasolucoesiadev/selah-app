import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  tone?: 'surface' | 'soft';
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Card({ children, onPress, tone = 'surface', style, accessibilityLabel }: CardProps) {
  const { colors, shadow } = useTheme();
  const base: ViewStyle = {
    backgroundColor: tone === 'soft' ? colors.surfaceAlt : colors.surface,
    borderRadius: radius.xl,
    padding: 20,
    borderColor: colors.border,
    ...shadow(1),
  };

  if (!onPress) return <View style={[base, style]}>{children}</View>;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [base, { opacity: pressed ? 0.9 : 1, transform: [{ scale: pressed ? 0.99 : 1 }] }, style]}
    >
      {children}
    </Pressable>
  );
}
