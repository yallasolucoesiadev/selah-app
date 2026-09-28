import { daysSince } from '@/lib/journey';
import { listChallenges, listPrayers, listProgress, listReflections } from '@/services/data';
import { useAuth } from './useAuth';
import { useLoad } from './useLoad';

interface Stats {
  completed: number;
  prayers: number;
  reflections: number;
  challengesDone: number;
}

const EMPTY: Stats = { completed: 0, prayers: 0, reflections: 0, challengesDone: 0 };

export function useStats() {
  const { profile } = useAuth();
  const { data, loading, reload } = useLoad<Stats>(async () => {
    const [progress, prayers, reflections, challenges] = await Promise.all([
      listProgress(),
      listPrayers(),
      listReflections(),
      listChallenges(),
    ]);
    return {
      completed: progress.filter((p) => p.status === 'completed').length,
      prayers: prayers.length,
      reflections: reflections.length,
      challengesDone: challenges.filter((c) => c.status === 'done').length,
    };
  }, EMPTY);

  return { ...data, journeyDays: daysSince(profile?.created_at), loading, reload };
}
