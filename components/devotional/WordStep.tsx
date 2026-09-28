import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { AudioPlayer } from '@/components/AudioPlayer';
import { Button } from '@/components/Button';
import { FavoriteButton } from '@/components/FavoriteButton';
import { Text } from '@/components/Text';
import { radius } from '@/constants/radius';
import { MIN_TOUCH } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { speak, stopSpeaking } from '@/services/speechService';
import type { Devotional } from '@/types';
import { ReaderControls } from './ReaderControls';

interface WordStepProps {
  devotional: Devotional;
  favorite: boolean;
  onToggleFavorite: () => void;
  onNext: () => void;
}

export function WordStep({ devotional, favorite, onToggleFavorite, onNext }: WordStepProps) {
  const { colors } = useTheme();
  const [speaking, setSpeaking] = useState(false);
  const paragraphs = devotional.content.split(/\n{2,}/).filter(Boolean);

  useEffect(() => () => stopSpeaking(), []);

  const toggleSpeech = () => {
    if (speaking) {
      stopSpeaking();
      setSpeaking(false);
      return;
    }
    setSpeaking(true);
    speak(`${devotional.title}. ${devotional.verse_text}. ${devotional.content}`, () => setSpeaking(false));
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <ReaderControls />
          <FavoriteButton active={favorite} onToggle={onToggleFavorite} />
        </View>

        {devotional.audio_url ? (
          <AudioPlayer uri={devotional.audio_url} title={devotional.title} resumeKey={devotional.id} />
        ) : (
          <Pressable
            onPress={toggleSpeech}
            accessibilityRole="button"
            accessibilityLabel={speaking ? 'Parar leitura em voz alta' : 'Ouvir leitura em voz alta'}
            style={{
              minHeight: MIN_TOUCH,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              paddingHorizontal: 16,
              borderRadius: radius.full,
              backgroundColor: colors.surfaceAlt,
              alignSelf: 'flex-start',
            }}
          >
            <Ionicons name={speaking ? 'stop-circle-outline' : 'volume-medium-outline'} size={22} color={colors.caramel} />
            <Text variant="label">{speaking ? 'Parar leitura' : 'Ouvir leitura'}</Text>
          </Pressable>
        )}

        <View style={{ gap: 6 }}>
          <Text variant="overline" tone="accent">
            Dia {devotional.day_number}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {devotional.title}
          </Text>
          <Text variant="label" tone="muted">
            {devotional.verse_reference}
          </Text>
        </View>

        <Text variant="verse" style={{ borderLeftWidth: 3, borderLeftColor: colors.gold, paddingLeft: 16 }}>
          “{devotional.verse_text}”
        </Text>

        <View style={{ gap: 14 }}>
          {paragraphs.map((p, i) => (
            <Text key={i} variant="bodyLarge">
              {p}
            </Text>
          ))}
        </View>

        {devotional.highlight_phrase ? (
          <View style={{ backgroundColor: colors.goldSoft, borderRadius: radius.lg, padding: 20 }}>
            <Text variant="overline" tone="accent" style={{ marginBottom: 6 }}>
              Para guardar
            </Text>
            <Text variant="heading">{devotional.highlight_phrase}</Text>
          </View>
        ) : null}
      </ScrollView>
      <Button title="Continuar" onPress={() => { stopSpeaking(); onNext(); }} />
    </View>
  );
}
