import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { ReflectionInput } from '@/components/ReflectionInput';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useJourney } from '@/hooks/useJourney';
import { useLoad } from '@/hooks/useLoad';
import { listChallenges, setChallenge } from '@/services/data';
import type { ChallengeLog } from '@/types';

export default function ChallengeScreen() {
  const { devotionalId } = useLocalSearchParams<{ devotionalId?: string }>();
  const journey = useJourney();
  const { data: logs, reload } = useLoad<ChallengeLog[]>(listChallenges, []);
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const devotional =
    journey.devotionals.find((d) => d.id === devotionalId) ?? journey.today ?? null;
  const log = logs.find((l) => l.devotional_id === devotional?.id) ?? null;

  useEffect(() => {
    setNotes(log?.notes ?? '');
  }, [log?.id, log?.notes]);

  const update = async (status: 'pending' | 'done', withNotes?: string) => {
    if (!devotional) return;
    setBusy(true);
    setError(null);
    try {
      await setChallenge(devotional.id, status, withNotes);
      await reload();
    } catch {
      setError('Não foi possível salvar agora. Tente novamente.');
    } finally {
      setBusy(false);
    }
  };

  const titleOf = (id: string) => journey.devotionals.find((d) => d.id === id);

  return (
    <Screen>
      <Header back title="Desafio de hoje" subtitle="Uma ação simples de amor ao próximo." />

      {!devotional?.challenge_text ? (
        <EmptyState icon="heart-outline" title="Sem desafio por enquanto" message="Quando houver um desafio para este dia, ele aparece aqui." />
      ) : (
        <Card style={{ gap: 16 }}>
          <Text variant="overline" tone="accent">
            Dia {devotional.day_number} · {devotional.title}
          </Text>
          <Text variant="heading">{devotional.challenge_text}</Text>

          {!log ? (
            <Button title="Vou fazer" onPress={() => void update('pending')} loading={busy} />
          ) : log.status === 'pending' ? (
            <>
              <Text tone="muted">Combinado. Quando fizer, marque como concluído.</Text>
              <Button title="Concluído" onPress={() => void update('done')} loading={busy} />
            </>
          ) : (
            <>
              <Text tone="success" variant="label">
                Concluído ✓
              </Text>
              <Text variant="heading">Como foi?</Text>
              <ReflectionInput value={notes} onChangeText={setNotes} placeholder="Conte como foi essa experiência…" minHeight={110} accessibilityLabel="Como foi?" />
              <Button title="Salvar" variant="secondary" onPress={() => void update('done', notes.trim())} loading={busy} />
            </>
          )}
          {error ? <Text tone="danger">{error}</Text> : null}
        </Card>
      )}

      <View style={{ marginTop: 32, gap: 12, paddingBottom: 24 }}>
        <Text variant="heading">Meus desafios</Text>
        {logs.length === 0 ? (
          <Text tone="muted">Seus desafios aparecerão aqui.</Text>
        ) : (
          logs.map((l) => {
            const d = titleOf(l.devotional_id);
            return (
              <Card key={l.id} tone="soft" style={{ gap: 4 }}>
                <Text variant="label">
                  {d ? `Dia ${d.day_number} · ${d.title}` : 'Desafio'}
                </Text>
                <Text variant="caption" tone={l.status === 'done' ? 'success' : 'muted'}>
                  {l.status === 'done' ? 'Concluído' : 'Em andamento'}
                </Text>
                {l.notes ? <Text>{l.notes}</Text> : null}
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}
