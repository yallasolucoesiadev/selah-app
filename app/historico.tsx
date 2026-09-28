import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useJourney } from '@/hooks/useJourney';
import { useLoad } from '@/hooks/useLoad';
import { formatDate } from '@/lib/format';
import { listChallenges, listPrayers, listReflections } from '@/services/data';

interface Extras {
  reflections: Set<string>;
  prayers: Set<string>;
  challenges: Set<string>;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { devotionals, byDevotional, completedIds } = useJourney();
  const { data: extras } = useLoad<Extras>(
    async () => {
      const [reflections, prayers, challenges] = await Promise.all([listReflections(), listPrayers(), listChallenges()]);
      return {
        reflections: new Set(reflections.map((r) => r.devotional_id)),
        prayers: new Set(prayers.map((p) => p.devotional_id ?? '')),
        challenges: new Set(challenges.filter((c) => c.status === 'done').map((c) => c.devotional_id)),
      };
    },
    { reflections: new Set(), prayers: new Set(), challenges: new Set() },
  );

  const done = devotionals
    .filter((d) => completedIds.has(d.id))
    .sort((a, b) => (byDevotional.get(b.id)?.completed_at ?? '').localeCompare(byDevotional.get(a.id)?.completed_at ?? ''));

  return (
    <Screen>
      <Header back title="Histórico" subtitle="Seu caminho espiritual, só seu." />
      {done.length === 0 ? (
        <EmptyState icon="time-outline" title="Ainda sem histórico" message="Cada momento concluído passa a aparecer aqui." />
      ) : (
        <View style={{ gap: 12, paddingBottom: 24 }}>
          {done.map((d) => {
            const parts = [
              'Devocional',
              extras.reflections.has(d.id) ? 'Reflexão' : null,
              extras.prayers.has(d.id) ? 'Oração' : null,
              extras.challenges.has(d.id) ? 'Desafio' : null,
            ].filter(Boolean);
            return (
              <Card
                key={d.id}
                accessibilityLabel={`Abrir dia ${d.day_number}: ${d.title}`}
                onPress={() => router.push({ pathname: '/devocional/[day]', params: { day: String(d.day_number) } })}
                style={{ gap: 4 }}
              >
                <Text variant="overline" tone="accent">
                  {formatDate(byDevotional.get(d.id)?.completed_at)}
                </Text>
                <Text variant="heading">
                  Dia {d.day_number} · {d.title}
                </Text>
                <Text variant="caption" tone="muted">
                  {parts.join(' · ')}
                </Text>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
