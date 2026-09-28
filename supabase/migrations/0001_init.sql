-- SELAH — schema inicial
-- Regra de ouro: RLS habilitado em TODAS as tabelas; usuário só acessa seus próprios dados.
-- A validação real vive aqui (RLS) e nas Edge Functions, nunca só no app.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type progress_status as enum ('not_started', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type conversation_context as enum ('devotional', 'livre');
exception when duplicate_object then null; end $$;

do $$ begin
  create type challenge_status as enum ('pending', 'done');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles (1:1 com auth.users)
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  reminder_time time,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Cria o perfil automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, nullif(trim(new.raw_user_meta_data ->> 'name'), ''))
  on conflict (id) do nothing;

  insert into public.ai_memory_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- devotionals (conteúdo autorizado; leitura para autenticados, escrita só service role)
-- ---------------------------------------------------------------------------
create table if not exists public.devotionals (
  id uuid primary key default gen_random_uuid(),
  day_number integer not null unique check (day_number between 1 and 366),
  date date,
  title text not null,
  verse_text text not null,
  verse_reference text not null,
  content text not null,
  highlight_phrase text,
  reflection_prompt text,
  challenge_text text,
  audio_url text,
  reflection_questions jsonb not null default '[]'::jsonb
);

-- ---------------------------------------------------------------------------
-- Tabelas do usuário
-- ---------------------------------------------------------------------------
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  devotional_id uuid not null references public.devotionals (id) on delete cascade,
  status progress_status not null default 'not_started',
  is_favorite boolean not null default false,
  completed_at timestamptz,
  unique (user_id, devotional_id)
);

create table if not exists public.reflections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  devotional_id uuid not null references public.devotionals (id) on delete cascade,
  content text not null check (char_length(content) <= 8000),
  created_at timestamptz not null default now()
);

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  devotional_id uuid references public.devotionals (id) on delete set null,
  messages jsonb not null default '[]'::jsonb,
  context conversation_context not null default 'livre',
  created_at timestamptz not null default now()
);

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  devotional_id uuid references public.devotionals (id) on delete set null,
  content text not null check (char_length(content) <= 8000),
  audio_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.challenges_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  devotional_id uuid not null references public.devotionals (id) on delete cascade,
  status challenge_status not null default 'pending',
  notes text check (notes is null or char_length(notes) <= 4000),
  created_at timestamptz not null default now(),
  unique (user_id, devotional_id)
);

create table if not exists public.ai_memory_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  memory_enabled boolean not null default false
);

-- Trigger de novo usuário (criado depois das tabelas que ele usa).
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Índices
create index if not exists user_progress_user_idx on public.user_progress (user_id);
create index if not exists reflections_user_idx on public.reflections (user_id, created_at desc);
create index if not exists ai_conversations_user_idx on public.ai_conversations (user_id, created_at desc);
create index if not exists prayers_user_idx on public.prayers (user_id, created_at desc);
create index if not exists challenges_user_idx on public.challenges_log (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Row Level Security — habilitado em TODAS as tabelas
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.devotionals enable row level security;
alter table public.user_progress enable row level security;
alter table public.reflections enable row level security;
alter table public.ai_conversations enable row level security;
alter table public.prayers enable row level security;
alter table public.challenges_log enable row level security;
alter table public.ai_memory_settings enable row level security;

-- profiles: o próprio usuário
create policy "profiles_select_own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles_insert_own" on public.profiles
  for insert to authenticated with check (id = (select auth.uid()));
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- devotionals: leitura para autenticados; sem policy de escrita => só service role (bypass RLS)
create policy "devotionals_read_authenticated" on public.devotionals
  for select to authenticated using (true);

-- Tabelas do usuário: cada uma só enxerga/escreve linhas com user_id = auth.uid()
create policy "user_progress_own" on public.user_progress
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "reflections_own" on public.reflections
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "ai_conversations_own" on public.ai_conversations
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "prayers_own" on public.prayers
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "challenges_log_own" on public.challenges_log
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

create policy "ai_memory_settings_own" on public.ai_memory_settings
  for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- Anônimo não acessa nada.
revoke all on all tables in schema public from anon;
