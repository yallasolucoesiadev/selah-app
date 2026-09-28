import React from 'react';
import { ScrollView, View } from 'react-native';

import { BreathingCircle } from '@/components/BreathingCircle';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';

export function PauseStep({ onNext }: { onNext: () => void }) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingVertical: 24 }}>
        <BreathingCircle size={200} />
        <View style={{ gap: 8, marginTop: 16 }}>
          <Text variant="display" align="center" accessibilityRole="header">
            Pare por alguns instantes.
          </Text>
          <Text variant="title" align="center" tone="accent">
            Respire.
          </Text>
          <Text variant="bodyLarge" align="center" tone="muted">
            Este momento é seu.
          </Text>
        </View>
      </ScrollView>
      <Button title="Continuar" onPress={onNext} />
    </View>
  );
}
