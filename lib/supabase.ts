import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { AppState } from 'react-native';

import { secureStorage } from './secureStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/** Falso quando o .env ainda não foi preenchido: o app roda em modo demonstração local. */
export const isSupabaseConfigured = Boolean(url && anonKey);

// Cliente único do app. Nunca hardcode URL/chave: use o .env (ver .env.example).
export const supabase = createClient(url || 'http://localhost:54321', anonKey || 'not-configured', {
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Renova o token só enquanto o app está em primeiro plano.
AppState.addEventListener('change', (state) => {
  if (!isSupabaseConfigured) return;
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
