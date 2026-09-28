/**
 * aiService — camada de IA do SELAH, DESACOPLADA da interface.
 *
 * As telas só chamam as funções exportadas aqui. Para trocar de provedor de IA
 * basta implementar `AiProvider` (ou alterar a Edge Function `ai-chat`); nenhuma tela muda.
 *
 * PERSONALIDADE DA IA (aplicada no servidor, na Edge Function — o prompt interno NUNCA
 * fica no app):
 *  - acolhedora, serena, respeitosa, inteligente, não julgadora;
 *  - espiritual sem ser invasiva; funciona como companheira de reflexão;
 *  - NUNCA finge ser Deus, nunca diz que é Deus, nunca afirma revelação divina;
 *  - não substitui pastor, psicólogo ou médico (sugere procurar ajuda quando fizer sentido);
 *  - nunca inventa versículos; ao citar a Bíblia, identifica corretamente a referência;
 *  - diferencia claramente: conteúdo bíblico, interpretação e reflexão gerada pela IA;
 *  - uma pergunta por vez, sempre considerando a resposta anterior (nunca genérica).
 *
 * SEGURANÇA: nenhuma API key de IA existe neste arquivo nem no app. A chave vive como
 * secret da Edge Function (supabase/functions/ai-chat). O app só envia o texto e o JWT do usuário.
 */
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { AiDevotionalContext, ChatMessage, Devotional } from '@/types';
import { AiRequest, AiResponse, mockComplete } from './aiMock';

export { CRISIS_MESSAGE, detectCrisis } from './aiMock';
export type { AiRequest, AiResponse, AiTask } from './aiMock';

/** Contrato que qualquer provedor precisa cumprir. */
export interface AiProvider {
  complete(request: AiRequest): Promise<AiResponse>;
}

/** Chama a Edge Function `ai-chat` (a chave do provedor fica lá, como secret). */
const edgeFunctionProvider: AiProvider = {
  async complete(request) {
    const { data, error } = await supabase.functions.invoke<AiResponse>('ai-chat', { body: request });
    if (error || !data || typeof data.text !== 'string') {
      throw new Error(error?.message ?? 'Resposta inválida da IA');
    }
    return data;
  },
};

/** Provedor local de demonstração (sem rede). */
const mockProvider: AiProvider = {
  complete: async (request) => {
    // Pequena pausa para a conversa parecer natural.
    await new Promise((resolve) => setTimeout(resolve, 700));
    return mockComplete(request);
  },
};

let customProvider: AiProvider | null = null;

/** Permite trocar o provedor em tempo de execução (testes, outro backend). */
export function setAiProvider(provider: AiProvider | null) {
  customProvider = provider;
}

async function complete(request: AiRequest): Promise<AiResponse> {
  if (customProvider) return customProvider.complete(request);
  if (isSupabaseConfigured) {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      try {
        return await edgeFunctionProvider.complete(request);
      } catch (error) {
        // Função ainda não publicada ou fora do ar: mantém o app utilizável com o mock.
        console.warn('[aiService] Edge Function indisponível, usando resposta simulada.', error);
      }
    }
  }
  return mockProvider.complete(request);
}

function toRequestMessages(messages: ChatMessage[]) {
  return messages.map((m) => ({ role: m.role, content: m.content }));
}

export function toAiContext(devotional: Devotional | null | undefined): AiDevotionalContext | null {
  if (!devotional) return null;
  return {
    title: devotional.title,
    verse_reference: devotional.verse_reference,
    verse_text: devotional.verse_text,
    highlight_phrase: devotional.highlight_phrase,
    reflection_questions: devotional.reflection_questions,
  };
}

/** Conversa livre ou contextual: devolve a próxima resposta da IA. */
export async function sendChatMessage(
  history: ChatMessage[],
  devotional?: Devotional | null,
): Promise<AiResponse> {
  return complete({ task: 'chat', messages: toRequestMessages(history), devotional: toAiContext(devotional) });
}

/** Reflexão guiada: primeira pergunta da IA depois da reflexão escrita pelo usuário. */
export async function getGuidedQuestion(devotional: Devotional, reflection: string): Promise<AiResponse> {
  return complete({ task: 'guided_question', messages: [], devotional: toAiContext(devotional), reflection });
}

/** Oração baseada SOMENTE no que o usuário compartilhou. Nunca é apresentada como mensagem de Deus. */
export async function generatePrayer(
  devotional: Devotional | null,
  reflection: string,
  history: ChatMessage[],
): Promise<AiResponse> {
  return complete({
    task: 'prayer',
    messages: toRequestMessages(history),
    devotional: toAiContext(devotional),
    reflection,
  });
}

/** Resumo pessoal do momento (usado como sugestão em "O que levar para o dia"). */
export async function summarizeMoment(
  devotional: Devotional,
  reflection: string,
  history: ChatMessage[],
): Promise<AiResponse> {
  return complete({
    task: 'summary',
    messages: toRequestMessages(history),
    devotional: toAiContext(devotional),
    reflection,
  });
}

/** Rótulo obrigatório em qualquer texto gerado pela IA. */
export const AI_DISCLAIMER =
  'Reflexão gerada por IA. Não é uma mensagem de Deus nem substitui pastor, psicólogo ou médico.';
