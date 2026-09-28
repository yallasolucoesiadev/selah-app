import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Calendar } from '@/components/Calendar';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Modal } from '@/components/Modal';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useJourney } from '@/hooks/useJourney';
import { progressLabel, progressRatio } from '@/lib/journey';

export default function JourneyScreen() {
  const router = useRouter();
  const { completedCount, completedDays, favoriteDays, availableDays, today } = useJourney();
  const [emptyDay, setEmptyDay] = useState<number | null>(null);

  const openDay = (day: number) => {
    if (availableDays.has(day)) router.push({ pathname: '/devocional/[day]', params: { day: String(day) } });
    else setEmptyDay(day);
  };

  return (
    <Screen>
      <Header title="Minha jornada" />
      <Card style={{ gap: 12, marginBottom: 24 }}>
        <Text variant="heading">{progressLabel(completedCount)}</Text>
        <ProgressBar value={progressRatio(completedCount)} height={10} label="Progresso da jornada" />
        <Text variant="caption" tone="muted">
          Sem pressa. Cada dia é um novo começo, e você pode voltar a qualquer momento.
        </Text>
      </Card>

      <View style={{ paddingBottom: 24 }}>
        <Calendar
          completed={completedDays}
          favorites={favoriteDays}
          available={availableDays}
          currentDay={today?.day_number}
          onSelectDay={openDay}
        />
      </View>

      <Modal
        visible={emptyDay !== null}
        onClose={() => setEmptyDay(null)}
        title={`Dia ${emptyDay ?? ''}`}
        message="O conteúdo deste dia ainda não está disponível. Ele aparecerá aqui quando for liberado."
      />
    </Screen>
  );
}
