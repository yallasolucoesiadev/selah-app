/**
 * aiService — camada de IA do SELAH, DESACOPLADA da interface.
 *
 * As telas só chamam as funções exportadas aqui. Para trocar de provedor de IA basta
 * implementar `AiProvider` (ou alterar a Edge Function `ai-chat`); nenhuma tela muda.
 *
 * PERSONALIDADE DA IA (definida no servidor, na Edge Function — o prompt interno NUNCA
 * fica no app):
 *  - acolhedora, serena, respeitosa, inteligente, não julgadora;
 *  - espiritual sem ser invasiva; funciona como companheira de reflexão;
 *  - NUNCA finge ser Deus, nunca diz que é Deus, nunca afirma revelação divina;
 *  - não substitui pastor, psicólogo ou médico (sugere procurar ajuda quando fizer sentido);
 *  - nunca inventa versículos; ao citar a Bíblia, identifica corretamente a referência;
 *  - diferencia conteúdo bíblico, interpretação e reflexão gerada pela IA;
 *  - uma pergunta por vez, sempre considerando a resposta anterior (nunca genérica).
 *
 * SEGURANÇA: nenhuma API key de IA existe neste arquivo nem no app. A chave da Anthropic
 * vive como secret da Edge Function (supabase/functions/ai-chat). O app só envia o texto
 * da conversa junto com o JWT do usuário.
 */
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { ChatMessage, Devotional } from '@/types';

export interface AiResponse {
  text: string;
  /** "crisis" quando a conversa sugere risco; a mensagem já orienta buscar ajuda humana. */
  flag?: 'crisis';
  /** Verdadeiro quando a IA não respondeu de fato (mensagem acolhedora de contingência). */
  fallback?: boolean;
}

/** Corpo enviado à Edge Function `ai-chat`. */
export interface AiRequest {
  message: string;
  context: 'devotional' | 'livre' | 'oracao';
  devotionalContent?: string;
  conversationHistory?: { role: 'user' | 'assistant'; content: string }[];
}

/** Contrato que qualquer provedor precisa cumprir. */
export interface AiProvider {
  complete(request: AiRequest): Promise<AiResponse>;
}

/** Mensagem de contingência: a tela nunca quebra por falha da IA. */
export const AI_FALLBACK_TEXT = 'Não consegui me conectar agora. Vamos tentar de novo em um instante?';

/** Modo demonstração (sem Supabase): não há backend de IA para chamar. */
export const AI_UNAVAILABLE_TEXT =
  'A conversa com a IA precisa do aplicativo conectado à sua conta. Configure o Supabase para ativá-la.';

/** Rótulo obrigatório em qualquer texto gerado pela IA. */
export const AI_DISCLAIMER =
  'Reflexão gerada por IA. Não é uma mensagem de Deus nem substitui pastor, psicólogo ou médico.';

const MAX_HISTORY = 20;

/** Chama a Edge Function `ai-chat` (a chave da Anthropic fica lá, como secret). */
const edgeFunctionProvider: AiProvider = {
  async complete(request) {
    const { data, error } = await supabase.functions.invoke<AiResponse & { error?: string }>('ai-chat', {
      body: request,
    });
    if (error || !data || typeof data.text !== 'string') {
      throw new Error(error?.message ?? 'Resposta inválida da IA');
    }
    if (data.error) console.warn(`[aiService] IA indisponível (${data.error}). Verifique a Edge Function ai-chat.`);
    return { text: data.text, flag: data.flag, fallback: data.fallback };
  },
};

let customProvider: AiProvider | null = null;

/** Permite trocar o provedor em tempo de execução (testes, outro backend). */
export function setAiProvider(provider: AiProvider | null) {
  customProvider = provider;
}

async function complete(request: AiRequest): Promise<AiResponse> {
  try {
    if (customProvider) return await customProvider.complete(request);
    if (!isSupabaseConfigured) return { text: AI_UNAVAILABLE_TEXT, fallback: true };
    return await edgeFunctionProvider.complete(request);
  } catch (error) {
    console.warn('[aiService] falha ao falar com a IA', error);
    return { text: AI_FALLBACK_TEXT, fallback: true };
  }
}

/** Conteúdo do devocional do dia, no formato usado como pano de fundo da conversa. */
export function formatDevotional(devotional: Devotional): string {
  const lines = [
    `Título: ${devotional.title}`,
    `Versículo (${devotional.verse_reference}): ${devotional.verse_text}`,
    '',
    devotional.content,
  ];
  if (devotional.highlight_phrase) lines.push('', `Frase de destaque: ${devotional.highlight_phrase}`);
  if (devotional.reflection_questions.length > 0) {
    lines.push('', 'Perguntas de reflexão do devocional:', ...devotional.reflection_questions.map((q) => `- ${q}`));
  }
  return lines.join('\n');
}

function toHistory(messages: ChatMessage[]) {
  return messages.slice(-MAX_HISTORY).map((m) => ({ role: m.role, content: m.content }));
}

/** Conversa livre ou contextual: `history` termina na última mensagem do usuário. */
export async function sendChatMessage(history: ChatMessage[], devotional?: Devotional | null): Promise<AiResponse> {
  const last = history[history.length - 1];
  if (!last || last.role !== 'user') return { text: AI_FALLBACK_TEXT, fallback: true };
  return complete({
    message: last.content,
    context: devotional ? 'devotional' : 'livre',
    devotionalContent: devotional ? formatDevotional(devotional) : undefined,
    conversationHistory: toHistory(history.slice(0, -1)),
  });
}

/** Reflexão guiada: a IA responde à reflexão escrita pelo usuário com uma pergunta. */
export async function getGuidedQuestion(devotional: Devotional, reflection: string): Promise<AiResponse> {
  return complete({
    message: reflection,
    context: 'devotional',
    devotionalContent: formatDevotional(devotional),
    conversationHistory: [],
  });
}

/**
 * Oração em primeira pessoa baseada SOMENTE no que o usuário compartilhou (reflexão + conversa).
 * O conteúdo do devocional não é enviado. Nunca é apresentada como mensagem de Deus.
 */
export async function generatePrayer(reflection: string, history: ChatMessage[]): Promise<AiResponse> {
  return complete({
    message: 'Escreva minha oração com base no que compartilhei.',
    context: 'oracao',
    conversationHistory: [{ role: 'user', content: reflection }, ...toHistory(history)],
  });
}

/** Resumo pessoal do momento. Montado localmente (não precisa de IA nem sai do aparelho). */
export function summarizeMoment(devotional: Devotional, reflection: string): AiResponse {
  const parts = [`Hoje você refletiu sobre "${devotional.title}" (${devotional.verse_reference}).`];
  const clean = reflection.replace(/\s+/g, ' ').trim();
  if (clean) parts.push(`Você trouxe: "${clean.length > 140 ? `${clean.slice(0, 140).trimEnd()}…` : clean}"`);
  if (devotional.highlight_phrase) parts.push(`Para levar: ${devotional.highlight_phrase}`);
  return { text: parts.join(' ') };
}
