import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface MenuRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  detail?: string;
  onPress: () => void;
}

export function MenuRow({ icon, label, detail, onPress }: MenuRowProps) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={detail ? `${label}, ${detail}` : label}
      style={({ pressed }) => ({
        minHeight: MIN_TOUCH + 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 8,
        opacity: pressed ? 0.7 : 1,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
      })}
    >
      <View
        style={{ width: 40, height: 40, borderRadius: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.goldSoft }}
      >
        <Ionicons name={icon} size={20} color={colors.caramel} />
      </View>
      <View style={{ flex: 1 }}>
        <Text variant="bodyLarge" style={{ fontSize: 17 }}>
          {label}
        </Text>
        {detail ? (
          <Text variant="caption" tone="muted">
            {detail}
          </Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </Pressable>
  );
}
