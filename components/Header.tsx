import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  /** Mostra o botão de voltar. */
  back?: boolean;
  /** Ícone de fechar em vez de voltar (telas modais). */
  close?: boolean;
  right?: React.ReactNode;
  onBack?: () => void;
}

export function Header({ title, subtitle, back = false, close = false, right, onBack }: HeaderProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const handleBack = () => {
    if (onBack) onBack();
    else if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={{ paddingTop: 12, paddingBottom: 16 }}>
      {(back || close || right) && (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: MIN_TOUCH }}>
          {back || close ? (
            <Pressable
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel={close ? 'Fechar' : 'Voltar'}
              hitSlop={8}
              style={{ width: MIN_TOUCH, height: MIN_TOUCH, alignItems: 'flex-start', justifyContent: 'center' }}
            >
              <Ionicons name={close ? 'close' : 'chevron-back'} size={26} color={colors.text} />
            </Pressable>
          ) : (
            <View />
          )}
          {right}
        </View>
      )}
      {title ? (
        <Text variant="title" accessibilityRole="header" style={{ marginTop: back || close ? 4 : 0 }}>
          {title}
        </Text>
      ) : null}
      {subtitle ? (
        <Text variant="body" tone="muted" style={{ marginTop: 4 }}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
