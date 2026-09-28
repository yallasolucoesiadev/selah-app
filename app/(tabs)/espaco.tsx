import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { MenuRow } from '@/components/MenuRow';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';

export default function SpaceScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const stats = useStats();

  return (
    <Screen>
      <Header title="Meu espaço" />
      <Card onPress={() => router.push('/perfil')} accessibilityLabel="Abrir perfil" style={{ marginBottom: 16, gap: 4 }}>
        <Text variant="heading">{profile?.name ?? 'Seu perfil'}</Text>
        <Text variant="caption" tone="muted">
          {stats.journeyDays} {stats.journeyDays === 1 ? 'dia' : 'dias'} de jornada · {stats.completed}{' '}
          {stats.completed === 1 ? 'momento concluído' : 'momentos concluídos'}
        </Text>
      </Card>

      <View>
        <MenuRow icon="heart-outline" label="Favoritos" onPress={() => router.push('/favoritos')} />
        <MenuRow icon="create-outline" label="Minhas reflexões" detail={`${stats.reflections} salvas`} onPress={() => router.push('/reflexoes')} />
        <MenuRow icon="hand-left-outline" label="Minhas orações" detail={`${stats.prayers} salvas`} onPress={() => router.push('/oracoes')} />
        <MenuRow icon="time-outline" label="Histórico" onPress={() => router.push('/historico')} />
        <MenuRow icon="trail-sign-outline" label="Minha jornada" onPress={() => router.push('/jornada')} />
        <MenuRow icon="notifications-outline" label="Lembretes" onPress={() => router.push('/lembretes')} />
        <MenuRow icon="settings-outline" label="Configurações" onPress={() => router.push('/configuracoes')} />
      </View>
    </Screen>
  );
}
