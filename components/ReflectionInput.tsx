import React from 'react';
import { TextInput, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { VoiceButton } from './VoiceButton';

interface ReflectionInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  minHeight?: number;
  maxLength?: number;
  accessibilityLabel?: string;
}

export function ReflectionInput({
  value,
  onChangeText,
  placeholder = 'Escreva com suas palavras…',
  minHeight = 160,
  maxLength = 4000,
  accessibilityLabel = 'Sua reflexão',
}: ReflectionInputProps) {
  const { colors, fontScale } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.lg,
        borderWidth: 1.5,
        borderColor: colors.border,
        padding: 16,
        gap: 8,
      }}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={colors.gold}
        multiline
        maxLength={maxLength}
        textAlignVertical="top"
        accessibilityLabel={accessibilityLabel}
        style={{ minHeight, fontFamily: fonts.sans, fontSize: 17 * fontScale, lineHeight: 27 * fontScale, color: colors.text }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <VoiceButton onText={(text) => onChangeText(value ? `${value} ${text}` : text)} />
      </View>
    </View>
  );
}
