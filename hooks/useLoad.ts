import { useFocusEffect } from 'expo-router';
import { DependencyList, useCallback, useState } from 'react';

/** Carrega dados assíncronos e recarrega toda vez que a tela volta ao foco. */
export function useLoad<T>(loader: () => Promise<T>, initial: T, deps: DependencyList = []) {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const run = useCallback(async () => {
    try {
      setData(await loader());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useFocusEffect(
    useCallback(() => {
      void run();
    }, [run]),
  );

  return { data, loading, error, reload: run, setData };
}
