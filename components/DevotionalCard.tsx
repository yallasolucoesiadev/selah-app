import React from 'react';
import { View } from 'react-native';

import type { Devotional } from '@/types';
import { Button } from './Button';
import { Card } from './Card';
import { FavoriteButton } from './FavoriteButton';
import { Text } from './Text';

interface DevotionalCardProps {
  devotional: Devotional;
  completed?: boolean;
  favorite?: boolean;
  onStart: () => void;
  onToggleFavorite?: () => void;
}

export function DevotionalCard({ devotional, completed = false, favorite = false, onStart, onToggleFavorite }: DevotionalCardProps) {
  const excerpt = devotional.highlight_phrase ?? devotional.verse_text;
  return (
    <Card style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text variant="overline" tone="accent">
          Seu momento de hoje
        </Text>
        {onToggleFavorite ? <FavoriteButton active={favorite} onToggle={onToggleFavorite} /> : null}
      </View>
      <Text variant="caption" tone="muted">
        Dia {devotional.day_number}
      </Text>
      <Text variant="title" accessibilityRole="header">
        {devotional.title}
      </Text>
      <Text variant="verse" numberOfLines={4}>
        “{excerpt}”
      </Text>
      <Text variant="label" tone="muted">
        {devotional.verse_reference}
      </Text>
      <View style={{ marginTop: 8 }}>
        <Button title={completed ? 'Rever meu momento' : 'Começar meu momento'} onPress={onStart} />
      </View>
    </Card>
  );
}
