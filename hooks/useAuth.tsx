import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { setActiveUser, getProfile, updateProfile as saveProfile } from '@/services/data';
import type { Profile } from '@/types';

const DEMO_KEY = 'selah.demo.v1';
const DEMO_ID = 'demo-user';

interface AuthResult {
  ok: boolean;
  message?: string;
  /** Cadastro criado, mas o e-mail precisa ser confirmado antes do primeiro login. */
  needsConfirmation?: boolean;
}

interface AuthContextValue {
  loading: boolean;
  signedIn: boolean;
  isDemo: boolean;
  configured: boolean;
  profile: Profile | null;
  /** Verdadeiro logo após abrir o link de recuperação de senha. */
  recovering: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<AuthResult>;
  updatePassword: (password: string) => Promise<AuthResult>;
  enterDemo: (name?: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, 'name' | 'reminder_time' | 'onboarding_completed_at'>>) => Promise<void>;
  clearRecovery: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function friendlyError(message: string, context?: 'email'): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('already registered') || m.includes('already been registered')) return 'Este e-mail já tem uma conta.';
  if (m.includes('password should be')) return 'A senha precisa ter pelo menos 6 caracteres.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  if (m.includes('rate limit')) return 'Muitas tentativas. Aguarde um pouco e tente de novo.';
  if (m.includes('network') || m.includes('fetch')) return 'Sem conexão. Verifique sua internet.';
  if (m.includes('smtp') || (context === 'email' && m.includes('unable to'))) return 'Não conseguimos enviar o e-mail agora. Verifique que o e-mail está correto e tente de novo.';
  return 'Não foi possível concluir. Tente novamente.';
}

/** Extrai tokens do link de recuperação (…#access_token=…&refresh_token=…&type=recovery). */
function parseAuthLink(url: string): { access_token: string; refresh_token: string; type: string | null } | null {
  const hash = url.split('#')[1] ?? url.split('?')[1];
  if (!hash) return null;
  const params = new URLSearchParams(hash);
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  if (!access_token || !refresh_token) return null;
  return { access_token, refresh_token, type: params.get('type') };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [demoName, setDemoName] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [recovering, setRecovering] = useState(false);

  const signedIn = Boolean(session) || isDemo;

  // Sessão inicial + escuta de mudanças (login, logout, renovação de token, recuperação).
  useEffect(() => {
    let active = true;
    (async () => {
      const demoRaw = await AsyncStorage.getItem(DEMO_KEY).catch(() => null);
      if (!isSupabaseConfigured) {
        if (active && demoRaw) {
          setDemoName((JSON.parse(demoRaw) as { name: string }).name);
          setIsDemo(true);
        }
        if (active) setLoading(false);
        return;
      }
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    })();

    if (!isSupabaseConfigured) return () => void (active = false);
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Link de recuperação de senha (app aberto via ancora://… / selah://… / Expo Go).
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const handle = async (url: string | null) => {
      if (!url) return;
      const tokens = parseAuthLink(url);
      if (!tokens) return;
      const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      if (!error && tokens.type === 'recovery') setRecovering(true);
    };
    Linking.getInitialURL().then(handle).catch(() => undefined);
    const sub = Linking.addEventListener('url', (event) => void handle(event.url));
    return () => sub.remove();
  }, []);

  // Mantém a camada de dados apontando para o usuário ativo.
  useEffect(() => {
    if (session) setActiveUser({ id: session.user.id, demo: false });
    else if (isDemo) setActiveUser({ id: DEMO_ID, demo: true });
    else setActiveUser(null);
  }, [session, isDemo]);

  const refreshProfile = useCallback(async () => {
    if (!signedIn) {
      setProfile(null);
      return;
    }
    try {
      const fallback =
        (session?.user.user_metadata as { name?: string } | undefined)?.name ?? demoName ?? undefined;
      setActiveUser(session ? { id: session.user.id, demo: false } : { id: DEMO_ID, demo: true });
      setProfile(await getProfile(fallback));
    } catch (error) {
      console.warn('[auth] não foi possível carregar o perfil', error);
    }
  }, [signedIn, session, demoName]);

  useEffect(() => {
    void refreshProfile();
  }, [refreshProfile]);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    if (!isSupabaseConfigured) return { ok: false, message: 'Supabase não configurado. Use o modo demonstração.' };
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? { ok: false, message: friendlyError(error.message) } : { ok: true };
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async (name, email, password) => {
    if (!isSupabaseConfigured) return { ok: false, message: 'Supabase não configurado. Use o modo demonstração.' };
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name: name.trim() }, emailRedirectTo: Linking.createURL('/') },
    });
    if (error) return { ok: false, message: friendlyError(error.message, 'email') };
    return { ok: true, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    if (isDemo) {
      await AsyncStorage.removeItem(DEMO_KEY);
      setIsDemo(false);
      setDemoName(null);
    }
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
    setRecovering(false);
  }, [isDemo]);

  const resetPassword = useCallback<AuthContextValue['resetPassword']>(async (email) => {
    if (!isSupabaseConfigured) return { ok: false, message: 'Supabase não configurado.' };
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: Linking.createURL('/'),
    });
    return error ? { ok: false, message: friendlyError(error.message, 'email') } : { ok: true };
  }, []);

  const updatePassword = useCallback<AuthContextValue['updatePassword']>(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, message: friendlyError(error.message) };
    setRecovering(false);
    return { ok: true };
  }, []);

  const enterDemo = useCallback(async (name?: string) => {
    const finalName = name?.trim() || 'Visitante';
    await AsyncStorage.setItem(DEMO_KEY, JSON.stringify({ name: finalName }));
    setDemoName(finalName);
    setIsDemo(true);
  }, []);

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (patch) => {
      await saveProfile(patch);
      await refreshProfile();
    },
    [refreshProfile],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      loading,
      signedIn,
      isDemo,
      configured: isSupabaseConfigured,
      profile,
      recovering,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      enterDemo,
      refreshProfile,
      updateProfile,
      clearRecovery: () => setRecovering(false),
    }),
    [loading, signedIn, isDemo, profile, recovering, signIn, signUp, signOut, resetPassword, updatePassword, enterDemo, refreshProfile, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
