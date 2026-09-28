import React from 'react';
import { Text as RNText, TextProps as RNTextProps, TextStyle } from 'react-native';

import { TextVariant, typography } from '@/constants/typography';
import { useTheme } from '@/hooks/useTheme';

export type TextTone = 'primary' | 'muted' | 'accent' | 'gold' | 'inverse' | 'danger' | 'success';

export interface TextProps extends RNTextProps {
  variant?: TextVariant;
  tone?: TextTone;
  align?: TextStyle['textAlign'];
}

export function Text({ variant = 'body', tone = 'primary', align, style, ...rest }: TextProps) {
  const { colors, fontScale } = useTheme();
  const base = typography[variant];
  const color = {
    primary: colors.text,
    muted: colors.textMuted,
    accent: colors.caramel,
    gold: colors.gold,
    inverse: colors.textInverse,
    danger: colors.danger,
    success: colors.success,
  }[tone];

  return (
    <RNText
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[
        {
          fontFamily: base.fontFamily,
          fontSize: base.fontSize * fontScale,
          lineHeight: base.lineHeight * fontScale,
          letterSpacing: base.letterSpacing,
          textTransform: base.textTransform,
          color,
          textAlign: align,
        },
        style,
      ]}
    />
  );
}
