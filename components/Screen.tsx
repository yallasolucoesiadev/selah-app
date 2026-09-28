import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { Edge, SafeAreaView } from 'react-native-safe-area-context';

import { SCREEN_PADDING } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';

interface ScreenProps {
  children: React.ReactNode;
  /** Conteúdo rolável (padrão). Use false para telas com layout fixo (ex.: chat). */
  scroll?: boolean;
  padded?: boolean;
  edges?: Edge[];
  contentStyle?: StyleProp<ViewStyle>;
  /** Área fixa no rodapé (ex.: botão principal). */
  footer?: React.ReactNode;
}

export function Screen({
  children,
  scroll = true,
  padded = true,
  edges = ['top', 'left', 'right'],
  contentStyle,
  footer,
}: ScreenProps) {
  const { colors } = useTheme();
  const padding = padded ? SCREEN_PADDING : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={edges}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {scroll ? (
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={[{ paddingHorizontal: padding, paddingBottom: 32, flexGrow: 1 }, contentStyle]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[{ flex: 1, paddingHorizontal: padding }, contentStyle]}>{children}</View>
        )}
        {footer ? <View style={{ paddingHorizontal: SCREEN_PADDING, paddingVertical: 12 }}>{footer}</View> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
