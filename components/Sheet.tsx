import React from 'react';
import { Modal as RNModal, Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

/** Painel que sobe da base da tela (seleção de horário, opções, avisos). */
export function Sheet({ visible, onClose, title, children }: SheetProps) {
  const { colors, shadow } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable accessibilityLabel="Fechar" onPress={onClose} style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        <Pressable
          accessibilityViewIsModal
          onPress={() => undefined}
          style={[
            {
              backgroundColor: colors.surface,
              borderTopLeftRadius: radius.xl,
              borderTopRightRadius: radius.xl,
              paddingTop: 12,
              paddingHorizontal: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: '85%',
            },
            shadow(2),
          ]}
        >
          <View style={{ alignSelf: 'center', width: 44, height: 5, borderRadius: 3, backgroundColor: colors.border, marginBottom: 16 }} />
          {title ? (
            <Text variant="heading" accessibilityRole="header" style={{ marginBottom: 12 }}>
              {title}
            </Text>
          ) : null}
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
