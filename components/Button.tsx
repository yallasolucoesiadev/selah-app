import * as Haptics from 'expo-haptics';
import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, ViewStyle } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = true,
  accessibilityHint,
  style,
}: ButtonProps) {
  const { colors, shadow } = useTheme();
  const inactive = disabled || loading;

  const background = variant === 'primary' ? colors.gold : 'transparent';
  const borderColor = variant === 'secondary' ? colors.border : 'transparent';
  const textColor = variant === 'primary' ? colors.onGold : variant === 'secondary' ? colors.text : colors.caramel;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={() => {
        Haptics.selectionAsync().catch(() => undefined);
        onPress();
      }}
      style={({ pressed }) => [
        {
          minHeight: MIN_TOUCH + 4,
          paddingHorizontal: 24,
          borderRadius: radius.full,
          backgroundColor: background,
          borderWidth: variant === 'secondary' ? 1.5 : 0,
          borderColor,
          alignItems: 'center',
          justifyContent: 'center',
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          opacity: inactive ? 0.55 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.985 : 1 }],
        },
        variant === 'primary' ? shadow(1) : null,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text variant="label" style={{ color: textColor, fontSize: 16 }}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
