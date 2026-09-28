import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { splitTime } from '@/lib/time';

export const REMINDER_TITLE = 'SELAH';
export const REMINDER_BODY = 'Seu momento com Deus está esperando por você. ☕';

const supported = Platform.OS !== 'web';

/** Exibe a notificação mesmo com o app aberto. Chamar uma vez no layout raiz. */
export function configureNotifications() {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily', {
    name: 'Lembrete diário',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const asked = await Notifications.requestPermissionsAsync();
  return asked.granted;
}

export async function cancelReminder() {
  if (!supported) return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Agenda o lembrete diário no horário escolhido (HH:MM). Substitui qualquer agendamento anterior.
 * Retorna false se não houve permissão ou o horário é inválido.
 */
export async function scheduleDailyReminder(time: string): Promise<boolean> {
  if (!supported) return false;
  const parsed = splitTime(time);
  if (!parsed) return false;
  if (!(await requestNotificationPermission())) return false;

  await ensureChannel();
  await Notifications.cancelAllScheduledNotificationsAsync();
  await Notifications.scheduleNotificationAsync({
    content: { title: REMINDER_TITLE, body: REMINDER_BODY },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: parsed.hour,
      minute: parsed.minute,
      channelId: 'daily',
    },
  });
  return true;
}
