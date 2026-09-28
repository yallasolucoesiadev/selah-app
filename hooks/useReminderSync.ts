import { useEffect, useRef } from 'react';

import { cancelReminder, scheduleDailyReminder } from '@/services/notificationService';
import { useAuth } from './useAuth';
import { usePrefs } from './usePrefs';

/**
 * Mantém o lembrete diário coerente com o perfil:
 *  1. aplica o horário escolhido no onboarding depois do primeiro login/cadastro;
 *  2. (re)agenda a notificação local quando o horário ou o interruptor de notificações mudam.
 */
export function useReminderSync() {
  const { signedIn, profile, updateProfile } = useAuth();
  const { prefs, setPref } = usePrefs();
  const applyingPending = useRef(false);

  useEffect(() => {
    if (!signedIn || !profile || !prefs.pendingReminderTime || applyingPending.current) return;
    applyingPending.current = true;
    const time = prefs.pendingReminderTime;
    updateProfile({ reminder_time: time, onboarding_completed_at: new Date().toISOString() })
      .then(() => setPref('pendingReminderTime', null))
      .catch((error) => console.warn('[reminder] não foi possível salvar o horário', error))
      .finally(() => {
        applyingPending.current = false;
      });
  }, [signedIn, profile, prefs.pendingReminderTime, updateProfile, setPref]);

  const reminderTime = profile?.reminder_time ?? null;
  useEffect(() => {
    if (!signedIn) return;
    if (prefs.notificationsEnabled && reminderTime) {
      scheduleDailyReminder(reminderTime).catch((error) => console.warn('[reminder] falha ao agendar', error));
    } else {
      cancelReminder().catch(() => undefined);
    }
  }, [signedIn, prefs.notificationsEnabled, reminderTime]);
}
