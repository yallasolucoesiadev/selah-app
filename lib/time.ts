/** Aceita "8:00", "08:00" ou "08:00:00" e devolve "HH:MM" (ou null se inválido). */
export function normalizeTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function splitTime(value: string): { hour: number; minute: number } | null {
  const normalized = normalizeTime(value);
  if (!normalized) return null;
  const [hour, minute] = normalized.split(':').map(Number);
  return { hour, minute };
}

export const REMINDER_PRESETS = ['07:00', '08:00', '09:00', '12:00', '18:00', '20:00'] as const;
