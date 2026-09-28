import React, { useMemo } from 'react';
import { Pressable, View } from 'react-native';

import { buildYearGrid } from '@/lib/journey';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface CalendarProps {
  /** Números de dia (1..365) já concluídos. */
  completed: ReadonlySet<number>;
  favorites: ReadonlySet<number>;
  /** Dias que já têm conteúdo disponível. */
  available: ReadonlySet<number>;
  currentDay?: number;
  onSelectDay: (day: number) => void;
}

const CELL = 38;

function Legend({ color, ring, label }: { color: string; ring?: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View
        style={{
          width: 14,
          height: 14,
          borderRadius: 14,
          backgroundColor: color,
          borderWidth: ring ? 2 : 0,
          borderColor: ring,
        }}
      />
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </View>
  );
}

/** Calendário anual (365 dias) com estados: não iniciado, concluído e favorito. */
export function Calendar({ completed, favorites, available, currentDay, onSelectDay }: CalendarProps) {
  const { colors } = useTheme();
  const months = useMemo(() => buildYearGrid(), []);

  return (
    <View style={{ gap: 20 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
        <Legend color={colors.gold} label="Concluído" />
        <Legend color="transparent" ring={colors.caramel} label="Favorito" />
        <Legend color={colors.surfaceAlt} label="Não iniciado" />
      </View>

      {months.map((month) => (
        <View key={month.name} style={{ gap: 8 }}>
          <Text variant="label" tone="accent">
            {month.name}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {month.days.map((day) => {
              const done = completed.has(day);
              const fav = favorites.has(day);
              const hasContent = available.has(day);
              const isCurrent = currentDay === day;
              const state = done ? 'concluído' : hasContent ? 'não iniciado' : 'sem conteúdo ainda';
              return (
                <Pressable
                  key={day}
                  onPress={() => onSelectDay(day)}
                  accessibilityRole="button"
                  accessibilityLabel={`Dia ${day}, ${state}${fav ? ', favorito' : ''}`}
                  style={{
                    width: CELL,
                    height: CELL,
                    borderRadius: CELL,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: done ? colors.gold : hasContent ? colors.surfaceAlt : 'transparent',
                    borderWidth: fav || isCurrent ? 2 : 1,
                    borderColor: fav ? colors.caramel : isCurrent ? colors.gold : hasContent ? 'transparent' : colors.border,
                    opacity: hasContent ? 1 : 0.55,
                  }}
                >
                  <Text variant="caption" style={{ color: done ? colors.onGold : colors.text, fontSize: 12 }}>
                    {day}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}
