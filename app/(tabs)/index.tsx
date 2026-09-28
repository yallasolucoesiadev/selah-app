import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/Card';
import { CupSteam } from '@/components/CupSteam';
import { DevotionalCard } from '@/components/DevotionalCard';
import { FadeIn } from '@/components/FadeIn';
import { ProgressBar } from '@/components/ProgressBar';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useAuth } from '@/hooks/useAuth';
import { useJourney } from '@/hooks/useJourney';
import { greetingFor } from '@/lib/greeting';
import { progressLabel, progressRatio } from '@/lib/journey';

export default function TodayScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { today, completedIds, favoriteIds, completedCount, loading, error, toggleFavorite } = useJourney();
  const firstName = profile?.name?.split(' ')[0];

  return (
    <Screen>
      <FadeIn>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 24, paddingBottom: 20 }}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text variant="display" accessibilityRole="header">
              {greetingFor()}
              {firstName ? ` ${firstName}` : ''}
            </Text>
            <Text variant="bodyLarge" tone="muted" style={{ marginTop: 4 }}>
              Vamos fazer uma pausa?
            </Text>
          </View>
          <CupSteam size={48} />
        </View>
      </FadeIn>

      {loading ? (
        <Text tone="muted">Preparando seu momento…</Text>
      ) : error ? (
        <Card tone="soft" style={{ gap: 8 }}>
          <Text>Não foi possível carregar seu momento agora.</Text>
          <Text variant="caption" tone="muted">
            {error}
          </Text>
        </Card>
      ) : !today ? (
        <Card tone="soft">
          <Text>O conteúdo devocional ainda não está disponível. Volte em breve.</Text>
        </Card>
      ) : (
        <View style={{ gap: 16 }}>
          <FadeIn delay={80}>
            <DevotionalCard
              devotional={today}
              completed={completedIds.has(today.id)}
              favorite={favoriteIds.has(today.id)}
              onStart={() => router.push({ pathname: '/devocional/[day]', params: { day: String(today.day_number) } })}
              onToggleFavorite={() => void toggleFavorite(today)}
            />
          </FadeIn>

          {today.challenge_text ? (
            <FadeIn delay={160}>
              <Card
                tone="soft"
                accessibilityLabel="Desafio de hoje"
                onPress={() => router.push({ pathname: '/desafio', params: { devotionalId: today.id } })}
                style={{ gap: 8 }}
              >
                <Text variant="overline" tone="accent">
                  Desafio de hoje
                </Text>
                <Text numberOfLines={3}>{today.challenge_text}</Text>
                <Text variant="label" tone="accent">
                  Ver desafio
                </Text>
              </Card>
            </FadeIn>
          ) : null}

          <FadeIn delay={240}>
            <Pressable
              onPress={() => router.push('/jornada')}
              accessibilityRole="button"
              accessibilityLabel={`Minha jornada: ${progressLabel(completedCount)}`}
              style={{ gap: 8, paddingVertical: 8 }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="label">Minha jornada</Text>
                <Text variant="caption" tone="muted">
                  {progressLabel(completedCount)}
                </Text>
              </View>
              <ProgressBar value={progressRatio(completedCount)} label="Progresso da jornada" />
            </Pressable>
          </FadeIn>
        </View>
      )}
      <View style={{ height: 8 }} />
      {!loading && !today ? <Button title="Atualizar" variant="secondary" onPress={() => router.replace('/')} /> : null}
    </Screen>
  );
}
