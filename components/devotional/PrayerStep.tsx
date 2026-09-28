import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';

import { Button } from '@/components/Button';
import { PrayerCard } from '@/components/PrayerCard';
import { Text } from '@/components/Text';
import { speak, stopSpeaking } from '@/services/speechService';

interface PrayerStepProps {
  prayer: string | null;
  saved: boolean;
  generating: boolean;
  onGenerate: () => void;
  onSave: () => void;
  onNext: () => void;
}

export function PrayerStep({ prayer, saved, generating, onGenerate, onSave, onNext }: PrayerStepProps) {
  const [speaking, setSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  const listen = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
    } else if (prayer) {
      setSpeaking(true);
      speak(prayer, () => setSpeaking(false));
    }
  };

  const copy = async () => {
    if (!prayer) return;
    await Clipboard.setStringAsync(prayer);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16, paddingBottom: 24 }}>
        <Text variant="display" accessibilityRole="header">
          {prayer ? 'Sua oração' : 'Quer transformar sua reflexão em uma oração?'}
        </Text>

        {prayer ? (
          <PrayerCard
            text={prayer}
            aiGenerated
            actions={[
              { icon: speaking ? 'stop-circle-outline' : 'volume-medium-outline', label: speaking ? 'Parar' : 'Ouvir', onPress: listen, active: speaking },
              { icon: copied ? 'checkmark' : 'copy-outline', label: copied ? 'Copiado' : 'Copiar', onPress: () => void copy() },
              { icon: saved ? 'bookmark' : 'bookmark-outline', label: saved ? 'Salva' : 'Salvar', onPress: onSave, active: saved },
              { icon: 'refresh-outline', label: 'Refazer', onPress: onGenerate },
            ]}
          />
        ) : (
          <Text variant="bodyLarge" tone="muted">
            Vou escrever uma oração usando apenas as palavras que você compartilhou. Ela é uma reflexão sua, não uma mensagem recebida
            de Deus.
          </Text>
        )}
      </ScrollView>

      <View style={{ gap: 8 }}>
        {prayer ? (
          <Button title="Continuar" onPress={onNext} />
        ) : (
          <>
            <Button title="Criar minha oração" onPress={onGenerate} loading={generating} />
            <Button title="Agora não" variant="ghost" onPress={onNext} />
          </>
        )}
      </View>
    </View>
  );
}
