import React from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { ReflectionInput } from '@/components/ReflectionInput';
import { Text } from '@/components/Text';
import type { Devotional } from '@/types';

interface ReflectionStepProps {
  devotional: Devotional;
  value: string;
  onChange: (text: string) => void;
  onNext: () => void;
  busy: boolean;
}

export function ReflectionStep({ devotional, value, onChange, onNext, busy }: ReflectionStepProps) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <Text variant="display" accessibilityRole="header">
          O que essa mensagem despertou em você?
        </Text>
        {devotional.reflection_prompt ? (
          <Text variant="bodyLarge" tone="muted">
            {devotional.reflection_prompt}
          </Text>
        ) : null}
        <ReflectionInput value={value} onChangeText={onChange} minHeight={200} />
        <Text variant="caption" tone="muted">
          Sua reflexão é pessoal e fica guardada só para você.
        </Text>
      </ScrollView>
      <Button title="Continuar" onPress={onNext} disabled={!value.trim()} loading={busy} />
    </View>
  );
}
