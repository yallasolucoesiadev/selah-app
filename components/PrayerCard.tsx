import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, View } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { Card } from './Card';
import { Text } from './Text';

interface Action {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  active?: boolean;
}

interface PrayerCardProps {
  text: string;
  date?: string;
  /** Mostra o aviso de que a oração foi gerada por IA a partir da reflexão do usuário. */
  aiGenerated?: boolean;
  actions?: Action[];
}

export function PrayerCard({ text, date, aiGenerated = false, actions = [] }: PrayerCardProps) {
  const { colors } = useTheme();
  return (
    <Card>
      {date ? (
        <Text variant="overline" tone="accent" style={{ marginBottom: 8 }}>
          {date}
        </Text>
      ) : null}
      <Text variant="verse" style={{ fontSize: 18 }} selectable>
        {text}
      </Text>
      {aiGenerated ? (
        <Text variant="caption" tone="muted" style={{ marginTop: 12 }}>
          Oração criada por IA a partir do que você compartilhou. Não é uma mensagem recebida de Deus.
        </Text>
      ) : null}
      {actions.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 12, marginLeft: -8 }}>
          {actions.map((a) => (
            <Pressable
              key={a.label}
              onPress={a.onPress}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              accessibilityState={{ selected: a.active }}
              style={{ minHeight: MIN_TOUCH, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Ionicons name={a.icon} size={20} color={a.active ? colors.caramel : colors.text} />
              <Text variant="label" style={{ color: a.active ? colors.caramel : colors.text }}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
