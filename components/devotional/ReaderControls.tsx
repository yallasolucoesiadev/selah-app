import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { FONT_SCALES } from '@/constants/typography';
import { usePrefs } from '@/hooks/usePrefs';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/Text';

function ControlButton({
  label,
  onPress,
  disabled,
  children,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{
        minWidth: MIN_TOUCH,
        height: MIN_TOUCH,
        borderRadius: MIN_TOUCH,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.surfaceAlt,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      {children}
    </Pressable>
  );
}

/** Controles de leitura: tamanho da fonte (+/-) e modo escuro. */
export function ReaderControls() {
  const { prefs, setPref } = usePrefs();
  const { isDark, colors } = useTheme();
  const index = Math.max(0, FONT_SCALES.findIndex((s) => s === prefs.fontScale));

  return (
    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
      <ControlButton
        label="Diminuir letra"
        disabled={index === 0}
        onPress={() => setPref('fontScale', FONT_SCALES[Math.max(0, index - 1)])}
      >
        <Text variant="label" style={{ fontSize: 14 }}>
          A-
        </Text>
      </ControlButton>
      <ControlButton
        label="Aumentar letra"
        disabled={index === FONT_SCALES.length - 1}
        onPress={() => setPref('fontScale', FONT_SCALES[Math.min(FONT_SCALES.length - 1, index + 1)])}
      >
        <Text variant="label" style={{ fontSize: 18 }}>
          A+
        </Text>
      </ControlButton>
      <ControlButton label={isDark ? 'Ativar modo claro' : 'Ativar modo escuro'} onPress={() => setPref('mode', isDark ? 'light' : 'dark')}>
        <Ionicons name={isDark ? 'sunny-outline' : 'moon-outline'} size={20} color={colors.text} />
      </ControlButton>
    </View>
  );
}
