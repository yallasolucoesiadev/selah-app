import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ReflectionInput } from '@/components/ReflectionInput';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';

interface MomentStepProps {
  summary: string | null;
  hasPrayer: boolean;
  takeaway: string;
  onTakeawayChange: (text: string) => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
}

function CheckRow({ label, done }: { label: string; done: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={24} color={done ? colors.success : colors.textMuted} />
      <Text variant="bodyLarge" tone={done ? 'primary' : 'muted'}>
        {label}
      </Text>
    </View>
  );
}

export function MomentStep({ summary, hasPrayer, takeaway, onTakeawayChange, onSave, saving, error }: MomentStepProps) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <Text variant="display" accessibilityRole="header">
          Seu momento
        </Text>
        <Card style={{ gap: 12 }}>
          <CheckRow label="Devocional" done />
          <CheckRow label="Reflexão" done />
          <CheckRow label="Oração" done={hasPrayer} />
        </Card>
        {summary ? (
          <Card tone="soft" style={{ gap: 6 }}>
            <Text variant="overline" tone="accent">
              Resumo do seu momento
            </Text>
            <Text>{summary}</Text>
          </Card>
        ) : null}
        <Text variant="heading">O que você quer levar para o seu dia?</Text>
        <ReflectionInput
          value={takeaway}
          onChangeText={onTakeawayChange}
          placeholder="Uma frase, uma intenção, um compromisso…"
          minHeight={110}
          accessibilityLabel="O que você quer levar para o seu dia"
        />
        {error ? (
          <Text tone="danger" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
      </ScrollView>
      <Button title="Salvar meu momento" onPress={onSave} loading={saving} />
    </View>
  );
}
