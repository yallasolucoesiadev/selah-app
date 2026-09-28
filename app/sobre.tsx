import Constants from 'expo-constants';
import React from 'react';
import { View } from 'react-native';

import { Header } from '@/components/Header';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version ?? '1.0.0';
  return (
    <Screen>
      <Header back title="Sobre" />
      <View style={{ alignItems: 'center', gap: 16, paddingBottom: 24 }}>
        <Logo width={240} />
        <Text variant="bodyLarge" align="center" tone="muted">
          SELAH é uma pausa: um momento diário para ler, refletir, conversar e orar, no seu ritmo.
        </Text>
        <Text align="center" tone="muted">
          A conversa com a IA é uma companhia de reflexão. Ela não é Deus, não traz revelação divina e não substitui pastor, psicólogo
          ou médico.
        </Text>
        <Text variant="caption" tone="muted">
          Versão {version}
        </Text>
      </View>
    </Screen>
  );
}
