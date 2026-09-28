import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Prefs {
  mode: ThemeMode;
  fontScale: number;
  notificationsEnabled: boolean;
  onboardingSeen: boolean;
  /** Horário escolhido no onboarding, aplicado ao perfil após login/cadastro. */
  pendingReminderTime: string | null;
}

const DEFAULT_PREFS: Prefs = {
  mode: 'system',
  fontScale: 1,
  notificationsEnabled: true,
  onboardingSeen: false,
  pendingReminderTime: null,
};

const KEY = 'selah.prefs.v1';

interface PrefsContextValue {
  prefs: Prefs;
  ready: boolean;
  setPref: <K extends keyof Prefs>(key: K, value: Prefs[K]) => void;
}

const PrefsContext = createContext<PrefsContextValue | null>(null);

export function PrefsProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<Prefs>(DEFAULT_PREFS);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active) return;
        if (raw) setPrefs({ ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<Prefs>) });
      })
      .catch(() => undefined)
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const setPref = useCallback<PrefsContextValue['setPref']>((key, value) => {
    setPrefs((current) => {
      const next = { ...current, [key]: value };
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ prefs, ready, setPref }), [prefs, ready, setPref]);
  return <PrefsContext.Provider value={value}>{children}</PrefsContext.Provider>;
}

export function usePrefs(): PrefsContextValue {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs precisa estar dentro de <PrefsProvider>');
  return ctx;
}
