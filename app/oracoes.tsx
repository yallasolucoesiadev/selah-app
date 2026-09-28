import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { EmptyState } from '@/components/EmptyState';
import { Header } from '@/components/Header';
import { PrayerCard } from '@/components/PrayerCard';
import { Screen } from '@/components/Screen';
import { useLoad } from '@/hooks/useLoad';
import { formatDate } from '@/lib/format';
import { deletePrayer, listPrayers } from '@/services/data';
import { speak, stopSpeaking } from '@/services/speechService';
import type { Prayer } from '@/types';

export default function PrayersScreen() {
  const { data: prayers, loading, reload } = useLoad<Prayer[]>(listPrayers, []);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => () => stopSpeaking(), []);

  const listen = (prayer: Prayer) => {
    if (speakingId === prayer.id) {
      stopSpeaking();
      setSpeakingId(null);
      return;
    }
    setSpeakingId(prayer.id);
    speak(prayer.content, () => setSpeakingId(null));
  };

  return (
    <Screen>
      <Header back title="Minhas orações" />
      {!loading && prayers.length === 0 ? (
        <EmptyState icon="hand-left-outline" title="Nenhuma oração salva" message="As orações que você criar e salvar aparecem aqui." />
      ) : (
        <View style={{ gap: 12, paddingBottom: 24 }}>
          {prayers.map((p) => (
            <PrayerCard
              key={p.id}
              text={p.content}
              date={formatDate(p.created_at)}
              actions={[
                {
                  icon: speakingId === p.id ? 'stop-circle-outline' : 'volume-medium-outline',
                  label: speakingId === p.id ? 'Parar' : 'Ouvir',
                  onPress: () => listen(p),
                  active: speakingId === p.id,
                },
                { icon: 'copy-outline', label: 'Copiar', onPress: () => void Clipboard.setStringAsync(p.content) },
                {
                  icon: 'trash-outline',
                  label: 'Excluir',
                  onPress: () => {
                    void deletePrayer(p.id).then(reload);
                  },
                },
              ]}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}
