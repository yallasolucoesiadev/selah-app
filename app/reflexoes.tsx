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
import { listReflections } from '@/services/data';
import type { Reflection } from '@/types';

export default function ReflectionsScreen() {
  const { devotionals } = useJourney();
  const { data: reflections, loading } = useLoad<Reflection[]>(listReflections, []);

  return (
    <Screen>
      <Header back title="Minhas reflexões" />
      {!loading && reflections.length === 0 ? (
        <EmptyState icon="create-outline" title="Nenhuma reflexão ainda" message="O que você escrever nos seus momentos fica guardado aqui, só para você." />
      ) : (
        <View style={{ gap: 12, paddingBottom: 24 }}>
          {reflections.map((r) => {
            const d = devotionals.find((x) => x.id === r.devotional_id);
            return (
              <Card key={r.id} style={{ gap: 6 }}>
                <Text variant="overline" tone="accent">
                  {formatDate(r.created_at)}
                </Text>
                {d ? (
                  <Text variant="label" tone="muted">
                    Dia {d.day_number} · {d.title}
                  </Text>
                ) : null}
                <Text selectable>{r.content}</Text>
              </Card>
            );
          })}
        </View>
      )}
    </Screen>
  );
}
