import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Adaptador de storage para a sessão do Supabase.
 * O SecureStore limita ~2KB por valor e o token de sessão costuma ser maior,
 * então o valor é dividido em pedaços. Na web (sem SecureStore) usa localStorage.
 */
const CHUNK_SIZE = 1800;
const countKey = (key: string) => `${key}.n`;
const chunkKey = (key: string, i: number) => `${key}.${i}`;

const isWeb = Platform.OS === 'web';

function webStorage(): Storage | null {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : null;
  } catch {
    return null;
  }
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) return webStorage()?.getItem(key) ?? null;
  const count = Number(await SecureStore.getItemAsync(countKey(key)));
  if (!count) return null;
  let value = '';
  for (let i = 0; i < count; i++) {
    const part = await SecureStore.getItemAsync(chunkKey(key, i));
    if (part === null) return null;
    value += part;
  }
  return value;
}

async function removeItem(key: string): Promise<void> {
  if (isWeb) {
    webStorage()?.removeItem(key);
    return;
  }
  const count = Number(await SecureStore.getItemAsync(countKey(key))) || 0;
  for (let i = 0; i < count; i++) await SecureStore.deleteItemAsync(chunkKey(key, i));
  await SecureStore.deleteItemAsync(countKey(key));
}

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    webStorage()?.setItem(key, value);
    return;
  }
  await removeItem(key);
  const parts = Math.ceil(value.length / CHUNK_SIZE);
  for (let i = 0; i < parts; i++) {
    await SecureStore.setItemAsync(chunkKey(key, i), value.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE));
  }
  await SecureStore.setItemAsync(countKey(key), String(parts));
}

export const secureStorage = { getItem, setItem, removeItem };
