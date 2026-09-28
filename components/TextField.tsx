import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
}

export function TextField({ label, error, style, ...rest }: TextFieldProps) {
  const { colors, fontScale } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <Text variant="label" tone="muted">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.gold}
        {...rest}
        style={[
          {
            minHeight: 52,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: error ? colors.danger : colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: 16,
            color: colors.text,
            fontFamily: fonts.sans,
            fontSize: 16 * fontScale,
          },
          style,
        ]}
      />
      {error ? (
        <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
