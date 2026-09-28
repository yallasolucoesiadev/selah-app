export type ProgressStatus = 'not_started' | 'completed';
export type ChallengeStatus = 'pending' | 'done';
export type ConversationContext = 'devotional' | 'livre';
export type ChatRole = 'user' | 'assistant';

export interface Profile {
  id: string;
  name: string | null;
  reminder_time: string | null;
  onboarding_completed_at: string | null;
  created_at: string;
}

export interface Devotional {
  id: string;
  day_number: number;
  date: string | null;
  title: string;
  verse_text: string;
  verse_reference: string;
  content: string;
  highlight_phrase: string | null;
  reflection_prompt: string | null;
  challenge_text: string | null;
  audio_url: string | null;
  reflection_questions: string[];
}

export interface UserProgress {
  id: string;
  user_id: string;
  devotional_id: string;
  status: ProgressStatus;
  is_favorite: boolean;
  completed_at: string | null;
}

export interface Reflection {
  id: string;
  user_id: string;
  devotional_id: string;
  content: string;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  created_at: string;
}

export interface AiConversation {
  id: string;
  user_id: string;
  devotional_id: string | null;
  messages: ChatMessage[];
  context: ConversationContext;
  created_at: string;
}

export interface Prayer {
  id: string;
  user_id: string;
  devotional_id: string | null;
  content: string;
  audio_url: string | null;
  created_at: string;
}

export interface ChallengeLog {
  id: string;
  user_id: string;
  devotional_id: string;
  status: ChallengeStatus;
  notes: string | null;
  created_at: string;
}

/** Contexto enviado à camada de IA (nunca contém segredos). */
export interface AiDevotionalContext {
  title: string;
  verse_reference: string;
  verse_text: string;
  highlight_phrase: string | null;
  reflection_questions: string[];
}
