import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import React from 'react';
import { Pressable } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';

interface FavoriteButtonProps {
  active: boolean;
  onToggle: () => void;
  size?: number;
}

export function FavoriteButton({ active, onToggle, size = 26 }: FavoriteButtonProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onToggle();
      }}
      accessibilityRole="button"
      accessibilityLabel={active ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      accessibilityState={{ selected: active }}
      hitSlop={6}
      style={{ width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={active ? 'heart' : 'heart-outline'} size={size} color={active ? colors.caramel : colors.textMuted} />
    </Pressable>
  );
}
