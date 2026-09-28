import { useRouter } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card } from '@/components/Card';
import { EmptyState } from '@/components/EmptyState';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useJourney } from '@/hooks/useJourney';

export default function FavoritesScreen() {
  const router = useRouter();
  const { devotionals, favoriteIds, toggleFavorite } = useJourney();
  const favorites = devotionals.filter((d) => favoriteIds.has(d.id));

  return (
    <Screen>
      <Header back title="Favoritos" />
      {favorites.length === 0 ? (
        <EmptyState icon="heart-outline" title="Nenhum favorito ainda" message="Toque no coração de um devocional para guardá-lo aqui." />
      ) : (
        <View style={{ gap: 12, paddingBottom: 24 }}>
          {favorites.map((d) => (
            <Card
              key={d.id}
              accessibilityLabel={`Abrir dia ${d.day_number}: ${d.title}`}
              onPress={() => router.push({ pathname: '/devocional/[day]', params: { day: String(d.day_number) } })}
              style={{ gap: 6 }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text variant="caption" tone="muted">
                  Dia {d.day_number}
                </Text>
                <FavoriteButton active onToggle={() => void toggleFavorite(d)} />
              </View>
              <Text variant="heading">{d.title}</Text>
              <Text variant="verse" numberOfLines={3}>
                “{d.highlight_phrase ?? d.verse_text}”
              </Text>
              <Text variant="label" tone="muted">
                {d.verse_reference}
              </Text>
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}
