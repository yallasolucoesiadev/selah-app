import { useMemo } from 'react';

import { completeDevotional, listDevotionals, listProgress, setFavorite } from '@/services/data';
import type { Devotional, UserProgress } from '@/types';
import { useLoad } from './useLoad';

interface JourneyData {
  devotionals: Devotional[];
  progress: UserProgress[];
}

const EMPTY: JourneyData = { devotionals: [], progress: [] };

/**
 * Estado da jornada: devocionais, progresso e favoritos.
 * "Hoje" = o primeiro dia ainda não concluído (sem pressão de calendário);
 * se tudo estiver concluído, mostra o último dia.
 */
export function useJourney() {
  const { data, loading, error, reload, setData } = useLoad<JourneyData>(
    async () => {
      const [devotionals, progress] = await Promise.all([listDevotionals(), listProgress()]);
      return { devotionals, progress };
    },
    EMPTY,
  );

  const derived = useMemo(() => {
    const byDevotional = new Map(data.progress.map((p) => [p.devotional_id, p]));
    const completedIds = new Set(data.progress.filter((p) => p.status === 'completed').map((p) => p.devotional_id));
    const favoriteIds = new Set(data.progress.filter((p) => p.is_favorite).map((p) => p.devotional_id));
    const sorted = [...data.devotionals].sort((a, b) => a.day_number - b.day_number);
    const today = sorted.find((d) => !completedIds.has(d.id)) ?? sorted[sorted.length - 1] ?? null;

    const dayOf = (ids: Set<string>) =>
      new Set(sorted.filter((d) => ids.has(d.id)).map((d) => d.day_number));

    return {
      byDevotional,
      completedIds,
      favoriteIds,
      today,
      completedCount: completedIds.size,
      completedDays: dayOf(completedIds),
      favoriteDays: dayOf(favoriteIds),
      availableDays: new Set(sorted.map((d) => d.day_number)),
    };
  }, [data]);

  const toggleFavorite = async (devotional: Devotional) => {
    const next = !derived.favoriteIds.has(devotional.id);
    // Atualização otimista: a interface responde na hora.
    setData((current) => {
      const exists = current.progress.some((p) => p.devotional_id === devotional.id);
      const progress = exists
        ? current.progress.map((p) => (p.devotional_id === devotional.id ? { ...p, is_favorite: next } : p))
        : [
            ...current.progress,
            {
              id: `tmp-${devotional.id}`,
              user_id: '',
              devotional_id: devotional.id,
              status: 'not_started' as const,
              is_favorite: next,
              completed_at: null,
            },
          ];
      return { ...current, progress };
    });
    try {
      await setFavorite(devotional.id, next);
    } finally {
      await reload();
    }
  };

  const markCompleted = async (devotional: Devotional) => {
    await completeDevotional(devotional.id);
    await reload();
  };

  return { ...data, ...derived, loading, error, reload, toggleFavorite, markCompleted };
}
