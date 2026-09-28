import React from 'react';
import { Pressable } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface ChipProps {
  label: string;
  onPress: () => void;
  selected?: boolean;
}

export function Chip({ label, onPress, selected = false }: ChipProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => ({
        minHeight: MIN_TOUCH - 4,
        paddingHorizontal: 18,
        borderRadius: radius.full,
        justifyContent: 'center',
        backgroundColor: selected ? colors.gold : colors.surface,
        borderWidth: 1,
        borderColor: selected ? colors.gold : colors.border,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <Text variant="label" style={{ color: selected ? colors.onGold : colors.text }}>
        {label}
      </Text>
    </Pressable>
  );
}
