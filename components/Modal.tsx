import React from 'react';
import { Modal as RNModal, Pressable, View } from 'react-native';

import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { Button } from './Button';
import { Text } from './Text';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  onConfirm?: () => void;
  cancelLabel?: string;
}

/** Diálogo centralizado, sem susto: fundo suave e ações claras. */
export function Modal({ visible, onClose, title, message, children, confirmLabel, onConfirm, cancelLabel = 'Fechar' }: ModalProps) {
  const { colors, shadow } = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        accessibilityLabel="Fechar"
        onPress={onClose}
        style={{ flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: 24 }}
      >
        <Pressable
          accessibilityViewIsModal
          onPress={() => undefined}
          style={[{ width: '100%', maxWidth: 420, backgroundColor: colors.surface, borderRadius: radius.lg, padding: 24, gap: 12 }, shadow(2)]}
        >
          <Text variant="heading" accessibilityRole="header">
            {title}
          </Text>
          {message ? <Text tone="muted">{message}</Text> : null}
          {children}
          <View style={{ gap: 8, marginTop: 8 }}>
            {confirmLabel && onConfirm ? <Button title={confirmLabel} onPress={onConfirm} /> : null}
            <Button title={cancelLabel} variant={confirmLabel ? 'ghost' : 'secondary'} onPress={onClose} />
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}
