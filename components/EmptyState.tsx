import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
}

export function EmptyState({ icon, title, message }: EmptyStateProps) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 48, paddingHorizontal: 16 }}>
      <View style={{ width: 72, height: 72, borderRadius: 72, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={30} color={colors.caramel} />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      <Text tone="muted" align="center">
        {message}
      </Text>
    </View>
  );
}
