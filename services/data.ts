/**
 * Camada de dados do SELAH.
 *
 * - Com Supabase configurado: todas as leituras/gravações passam pelo cliente autenticado
 *   e são protegidas por RLS (o usuário só acessa as próprias linhas).
 * - Sem Supabase (.env vazio): modo demonstração, com dados locais em AsyncStorage.
 *
 * As telas só conversam com este módulo; nunca com o Supabase diretamente.
 */
import { PLACEHOLDER_DEVOTIONALS } from '@/constants/placeholderDevotionals';
import { uid } from '@/lib/id';
import { supabase } from '@/lib/supabase';
import { normalizeTime } from '@/lib/time';
import type {
  AiConversation,
  ChallengeLog,
  ChallengeStatus,
  ChatMessage,
  ConversationContext,
  Devotional,
  Prayer,
  Profile,
  Reflection,
  UserProgress,
} from '@/types';
import { readTable, readValue, writeTable, writeValue } from './localStore';

interface ActiveUser {
  id: string;
  demo: boolean;
}

let active: ActiveUser | null = null;

export function setActiveUser(user: ActiveUser | null) {
  active = user;
}

function current(): ActiveUser {
  if (!active) throw new Error('Nenhum usuário ativo.');
  return active;
}

function must<T>(result: { data: T | null; error: { message: string } | null }): T {
  if (result.error) throw new Error(result.error.message);
  return result.data as T;
}

const nowIso = () => new Date().toISOString();

// ---------------------------------------------------------------------------
// Devocionais
// ---------------------------------------------------------------------------
function normalizeDevotional(row: Devotional): Devotional {
  const questions = Array.isArray(row.reflection_questions) ? row.reflection_questions : [];
  return { ...row, reflection_questions: questions.map(String) };
}

export async function listDevotionals(): Promise<Devotional[]> {
  const { demo } = current();
  if (demo) return PLACEHOLDER_DEVOTIONALS;
  const rows = must(await supabase.from('devotionals').select('*').order('day_number'));
  return (rows as Devotional[]).map(normalizeDevotional);
}

export async function getDevotionalByDay(day: number): Promise<Devotional | null> {
  const all = await listDevotionals();
  return all.find((d) => d.day_number === day) ?? null;
}

// ---------------------------------------------------------------------------
// Perfil
// ---------------------------------------------------------------------------
export async function getProfile(fallbackName?: string): Promise<Profile> {
  const { id, demo } = current();
  if (demo) {
    return readValue<Profile>('profile', {
      id,
      name: fallbackName ?? null,
      reminder_time: '08:00',
      onboarding_completed_at: null,
      created_at: nowIso(),
    }).then(async (profile) => {
      await writeValue('profile', profile);
      return profile;
    });
  }
  const result = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  const row = must(result) as Profile | null;
  if (row) return { ...row, reminder_time: normalizeTime(row.reminder_time) };
  const created = must(
    await supabase
      .from('profiles')
      .upsert({ id, name: fallbackName ?? null })
      .select('*')
      .single(),
  ) as Profile;
  return { ...created, reminder_time: normalizeTime(created.reminder_time) };
}

export async function updateProfile(patch: Partial<Pick<Profile, 'name' | 'reminder_time' | 'onboarding_completed_at'>>) {
  const { id, demo } = current();
  if (demo) {
    const profile = await getProfile();
    await writeValue('profile', { ...profile, ...patch });
    return;
  }
  const payload: Record<string, unknown> = { ...patch };
  must(await supabase.from('profiles').update(payload).eq('id', id).select('id'));
}

// ---------------------------------------------------------------------------
// Progresso e favoritos
// ---------------------------------------------------------------------------
export async function listProgress(): Promise<UserProgress[]> {
  const { id, demo } = current();
  if (demo) return readTable<UserProgress>('user_progress');
  return must(await supabase.from('user_progress').select('*').eq('user_id', id)) as UserProgress[];
}

async function upsertProgress(devotionalId: string, patch: Partial<UserProgress>): Promise<UserProgress> {
  const { id, demo } = current();
  if (demo) {
    const rows = await readTable<UserProgress>('user_progress');
    const index = rows.findIndex((r) => r.devotional_id === devotionalId);
    const base: UserProgress =
      index >= 0
        ? rows[index]
        : {
            id: uid(),
            user_id: id,
            devotional_id: devotionalId,
            status: 'not_started',
            is_favorite: false,
            completed_at: null,
          };
    const next = { ...base, ...patch };
    if (index >= 0) rows[index] = next;
    else rows.push(next);
    await writeTable('user_progress', rows);
    return next;
  }
  return must(
    await supabase
      .from('user_progress')
      .upsert({ user_id: id, devotional_id: devotionalId, ...patch }, { onConflict: 'user_id,devotional_id' })
      .select('*')
      .single(),
  ) as UserProgress;
}

export async function completeDevotional(devotionalId: string) {
  return upsertProgress(devotionalId, { status: 'completed', completed_at: nowIso() });
}

export async function setFavorite(devotionalId: string, isFavorite: boolean) {
  return upsertProgress(devotionalId, { is_favorite: isFavorite });
}

// ---------------------------------------------------------------------------
// Reflexões
// ---------------------------------------------------------------------------
export async function saveReflection(devotionalId: string, content: string): Promise<Reflection> {
  const { id, demo } = current();
  const text = content.trim();
  if (demo) {
    const rows = await readTable<Reflection>('reflections');
    const row: Reflection = { id: uid(), user_id: id, devotional_id: devotionalId, content: text, created_at: nowIso() };
    await writeTable('reflections', [row, ...rows]);
    return row;
  }
  return must(
    await supabase.from('reflections').insert({ user_id: id, devotional_id: devotionalId, content: text }).select('*').single(),
  ) as Reflection;
}

export async function listReflections(): Promise<Reflection[]> {
  const { id, demo } = current();
  if (demo) return readTable<Reflection>('reflections');
  return must(
    await supabase.from('reflections').select('*').eq('user_id', id).order('created_at', { ascending: false }),
  ) as Reflection[];
}

// ---------------------------------------------------------------------------
// Orações
// ---------------------------------------------------------------------------
export async function savePrayer(devotionalId: string | null, content: string): Promise<Prayer> {
  const { id, demo } = current();
  if (demo) {
    const rows = await readTable<Prayer>('prayers');
    const row: Prayer = {
      id: uid(),
      user_id: id,
      devotional_id: devotionalId,
      content,
      audio_url: null,
      created_at: nowIso(),
    };
    await writeTable('prayers', [row, ...rows]);
    return row;
  }
  return must(
    await supabase.from('prayers').insert({ user_id: id, devotional_id: devotionalId, content }).select('*').single(),
  ) as Prayer;
}

export async function listPrayers(): Promise<Prayer[]> {
  const { id, demo } = current();
  if (demo) return readTable<Prayer>('prayers');
  return must(
    await supabase.from('prayers').select('*').eq('user_id', id).order('created_at', { ascending: false }),
  ) as Prayer[];
}

export async function deletePrayer(prayerId: string) {
  const { demo } = current();
  if (demo) {
    const rows = await readTable<Prayer>('prayers');
    await writeTable(
      'prayers',
      rows.filter((r) => r.id !== prayerId),
    );
    return;
  }
  must(await supabase.from('prayers').delete().eq('id', prayerId).select('id'));
}

// ---------------------------------------------------------------------------
// Conversas com a IA
// ---------------------------------------------------------------------------
export async function saveConversation(input: {
  conversationId?: string | null;
  devotionalId: string | null;
  context: ConversationContext;
  messages: ChatMessage[];
}): Promise<string> {
  const { id, demo } = current();
  if (demo) {
    const rows = await readTable<AiConversation>('ai_conversations');
    const index = input.conversationId ? rows.findIndex((r) => r.id === input.conversationId) : -1;
    if (index >= 0) {
      rows[index] = { ...rows[index], messages: input.messages };
      await writeTable('ai_conversations', rows);
      return rows[index].id;
    }
    const row: AiConversation = {
      id: uid(),
      user_id: id,
      devotional_id: input.devotionalId,
      messages: input.messages,
      context: input.context,
      created_at: nowIso(),
    };
    await writeTable('ai_conversations', [row, ...rows]);
    return row.id;
  }
  if (input.conversationId) {
    must(
      await supabase.from('ai_conversations').update({ messages: input.messages }).eq('id', input.conversationId).select('id'),
    );
    return input.conversationId;
  }
  const created = must(
    await supabase
      .from('ai_conversations')
      .insert({
        user_id: id,
        devotional_id: input.devotionalId,
        context: input.context,
        messages: input.messages,
      })
      .select('id')
      .single(),
  ) as { id: string };
  return created.id;
}

// ---------------------------------------------------------------------------
// Desafios
// ---------------------------------------------------------------------------
export async function listChallenges(): Promise<ChallengeLog[]> {
  const { id, demo } = current();
  if (demo) return readTable<ChallengeLog>('challenges_log');
  return must(
    await supabase.from('challenges_log').select('*').eq('user_id', id).order('created_at', { ascending: false }),
  ) as ChallengeLog[];
}

export async function setChallenge(devotionalId: string, status: ChallengeStatus, notes?: string | null) {
  const { id, demo } = current();
  if (demo) {
    const rows = await readTable<ChallengeLog>('challenges_log');
    const index = rows.findIndex((r) => r.devotional_id === devotionalId);
    const base: ChallengeLog =
      index >= 0
        ? rows[index]
        : { id: uid(), user_id: id, devotional_id: devotionalId, status: 'pending', notes: null, created_at: nowIso() };
    const next: ChallengeLog = { ...base, status, notes: notes === undefined ? base.notes : notes };
    if (index >= 0) rows[index] = next;
    else rows.unshift(next);
    await writeTable('challenges_log', rows);
    return next;
  }
  const payload: Record<string, unknown> = { user_id: id, devotional_id: devotionalId, status };
  if (notes !== undefined) payload.notes = notes;
  return must(
    await supabase
      .from('challenges_log')
      .upsert(payload, { onConflict: 'user_id,devotional_id' })
      .select('*')
      .single(),
  ) as ChallengeLog;
}

// ---------------------------------------------------------------------------
// Memória da IA (opcional, desligada por padrão)
// ---------------------------------------------------------------------------
export async function getMemoryEnabled(): Promise<boolean> {
  const { id, demo } = current();
  if (demo) return readValue<boolean>('memory_enabled', false);
  const row = must(await supabase.from('ai_memory_settings').select('memory_enabled').eq('user_id', id).maybeSingle()) as {
    memory_enabled: boolean;
  } | null;
  return row?.memory_enabled ?? false;
}

export async function setMemoryEnabled(enabled: boolean) {
  const { id, demo } = current();
  if (demo) {
    await writeValue('memory_enabled', enabled);
    return;
  }
  must(
    await supabase
      .from('ai_memory_settings')
      .upsert({ user_id: id, memory_enabled: enabled }, { onConflict: 'user_id' })
      .select('user_id'),
  );
}

/** Reflexões recentes enviadas à IA SOMENTE se o usuário ativou a memória. */
export async function getMemorySnippets(limit = 5): Promise<string[]> {
  if (!(await getMemoryEnabled())) return [];
  const reflections = await listReflections();
  return reflections.slice(0, limit).map((r) => r.content.slice(0, 400));
}
