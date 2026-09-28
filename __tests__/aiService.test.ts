import { AI_FALLBACK_TEXT, AiProvider, AiRequest, generatePrayer, getGuidedQuestion, sendChatMessage, setAiProvider, summarizeMoment } from '@/services/aiService';
import type { ChatMessage, Devotional } from '@/types';

jest.mock('@/lib/supabase', () => ({ isSupabaseConfigured: true, supabase: {} }));

const devotional: Devotional = {
  id: 'd1',
  day_number: 1,
  date: null,
  title: 'Aquietar o coração',
  verse_text: 'Aquietai-vos, e sabei que eu sou Deus.',
  verse_reference: 'Salmos 46:10',
  content: 'Texto do devocional.',
  highlight_phrase: 'Parar é cuidar da alma.',
  reflection_prompt: null,
  challenge_text: null,
  audio_url: null,
  reflection_questions: ['Pergunta A?'],
};

const msg = (role: ChatMessage['role'], content: string): ChatMessage => ({
  id: content,
  role,
  content,
  created_at: '2026-01-01T00:00:00Z',
});

function capture() {
  const requests: AiRequest[] = [];
  const provider: AiProvider = {
    complete: async (request) => {
      requests.push(request);
      return { text: 'resposta' };
    },
  };
  setAiProvider(provider);
  return requests;
}

afterEach(() => setAiProvider(null));

describe('aiService → contrato da Edge Function', () => {
  it('conversa livre: mensagem atual + histórico anterior, contexto "livre"', async () => {
    const requests = capture();
    await sendChatMessage([msg('user', 'Quero refletir'), msg('assistant', 'Sobre o quê?'), msg('user', 'Meu trabalho')]);
    expect(requests[0]).toMatchObject({
      message: 'Meu trabalho',
      context: 'livre',
      conversationHistory: [
        { role: 'user', content: 'Quero refletir' },
        { role: 'assistant', content: 'Sobre o quê?' },
      ],
    });
    expect(requests[0].devotionalContent).toBeUndefined();
  });

  it('no devocional envia o conteúdo do dia', async () => {
    const requests = capture();
    await sendChatMessage([msg('user', 'Oi')], devotional);
    expect(requests[0].context).toBe('devotional');
    expect(requests[0].devotionalContent).toContain('Texto do devocional.');
    expect(requests[0].devotionalContent).toContain('Salmos 46:10');
  });

  it('reflexão guiada usa a reflexão como mensagem', async () => {
    const requests = capture();
    await getGuidedQuestion(devotional, 'Sinto ansiedade');
    expect(requests[0]).toMatchObject({ message: 'Sinto ansiedade', context: 'devotional', conversationHistory: [] });
  });

  it('oração: contexto "oracao", só com o que o usuário compartilhou (sem conteúdo do devocional)', async () => {
    const requests = capture();
    await generatePrayer('Estou cansado', [msg('assistant', 'O que pesa?'), msg('user', 'O trabalho')]);
    expect(requests[0].context).toBe('oracao');
    expect(requests[0].devotionalContent).toBeUndefined();
    expect(requests[0].conversationHistory?.[0]).toEqual({ role: 'user', content: 'Estou cansado' });
    expect(requests[0].conversationHistory).toHaveLength(3);
  });

  it('se a IA falhar, devolve a mensagem acolhedora sem lançar erro', async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    setAiProvider({
      complete: async () => {
        throw new Error('boom');
      },
    });
    const reply = await sendChatMessage([msg('user', 'Oi')]);
    expect(reply).toEqual({ text: AI_FALLBACK_TEXT, fallback: true });
  });

  it('resumo do momento é local e usa a reflexão do usuário', () => {
    const { text } = summarizeMoment(devotional, 'Sinto ansiedade');
    expect(text).toContain('Aquietar o coração');
    expect(text).toContain('Sinto ansiedade');
  });
});
