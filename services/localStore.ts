import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Armazenamento local usado APENAS no modo demonstração (Supabase não configurado).
 * Em produção todos os dados do usuário vivem no Supabase, protegidos por RLS.
 */
const PREFIX = 'selah.local.';

export async function readTable<T>(table: string): Promise<T[]> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + table);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

export async function writeTable<T>(table: string, rows: T[]): Promise<void> {
  await AsyncStorage.setItem(PREFIX + table, JSON.stringify(rows));
}

export async function readValue<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeValue<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(PREFIX + key, JSON.stringify(value));
}
