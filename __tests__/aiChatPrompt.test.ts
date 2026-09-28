import {
  buildSystemPrompt,
  detectCrisis,
  FALLBACK_TEXT,
  MAX_CHARS,
  MAX_HISTORY,
  parseRequest,
  SYSTEM_PROMPT_BASE,
  toAnthropicMessages,
} from '@/supabase/functions/ai-chat/prompt';

describe('ai-chat / parseRequest', () => {
  it('aceita o contrato { message, context, devotionalContent, conversationHistory }', () => {
    const parsed = parseRequest({
      message: 'Oi',
      context: 'devotional',
      devotionalContent: 'Texto do dia',
      conversationHistory: [{ role: 'assistant', content: 'Olá' }],
    });
    expect(parsed).toEqual({
      message: 'Oi',
      context: 'devotional',
      devotionalContent: 'Texto do dia',
      conversationHistory: [{ role: 'assistant', content: 'Olá' }],
    });
  });

  it('histórico é opcional', () => {
    expect(parseRequest({ message: 'Oi', context: 'livre' })?.conversationHistory).toEqual([]);
  });

  it('rejeita corpo inválido: contexto desconhecido, mensagem vazia, papel inválido, histórico grande', () => {
    expect(parseRequest(null)).toBeNull();
    expect(parseRequest({ message: 'x', context: 'outro' })).toBeNull();
    expect(parseRequest({ message: '   ', context: 'livre' })).toBeNull();
    expect(parseRequest({ message: 'x', context: 'livre', conversationHistory: [{ role: 'system', content: 'y' }] })).toBeNull();
    const big = Array.from({ length: MAX_HISTORY + 1 }, () => ({ role: 'user', content: 'a' }));
    expect(parseRequest({ message: 'x', context: 'livre', conversationHistory: big })).toBeNull();
  });

  it('limita o tamanho dos textos no servidor', () => {
    const parsed = parseRequest({ message: 'a'.repeat(MAX_CHARS + 500), context: 'livre' });
    expect(parsed?.message).toHaveLength(MAX_CHARS);
  });
});

describe('ai-chat / prompt de sistema', () => {
  it('usa a base da SELAH e as regras invioláveis', () => {
    const promptDevocional = buildSystemPrompt({ context: 'devotional' });
    expect(promptDevocional.startsWith('Você é a SELAH, uma companheira de reflexão espiritual')).toBe(true);
    expect(promptDevocional).toContain(SYSTEM_PROMPT_BASE);
    expect(promptDevocional).toContain('Nunca afirmar ser Deus');
    expect(promptDevocional).toContain('não citar um versículo específico');
    expect(promptDevocional).toContain('Respostas curtas (2-4 frases)');

    const promptLivre = buildSystemPrompt({ context: 'livre' });
    expect(promptLivre).toContain('Você é a SELAH');
    expect(promptLivre).toContain('Nunca afirmar ser Deus');
    expect(promptLivre).toContain('Respostas curtas (2-4 frases)');
  });

  it('devotional inclui o conteúdo do dia; livre e oracao não', () => {
    const withContent = buildSystemPrompt({ context: 'devotional', devotionalContent: 'CONTEUDO-DO-DIA' });
    expect(withContent).toContain('CONTEUDO-DO-DIA');
    expect(buildSystemPrompt({ context: 'livre', devotionalContent: 'CONTEUDO-DO-DIA' })).not.toContain('CONTEUDO-DO-DIA');
    expect(buildSystemPrompt({ context: 'oracao', devotionalContent: 'CONTEUDO-DO-DIA' })).not.toContain('CONTEUDO-DO-DIA');
  });

  it("oracao: primeira pessoa, termina em 'Amém.', sem pergunta final e sem apresentar como mensagem de Deus", () => {
    const prompt = buildSystemPrompt({ context: 'oracao' });
    expect(prompt).toContain('primeira pessoa');
    expect(prompt).toContain('"Amém."');
    expect(prompt).toContain('não faça pergunta final');
    expect(prompt).toContain('Não apresente o texto como mensagem recebida de Deus');
  });

  it('memória só aparece quando fornecida (usuário optou)', () => {
    expect(buildSystemPrompt({ context: 'livre' })).not.toContain('reflexoes_anteriores');
    expect(buildSystemPrompt({ context: 'livre', memory: ['medo do futuro'] })).toContain('medo do futuro');
  });
});

describe('ai-chat / mensagens e segurança', () => {
  it('sempre termina na mensagem atual do usuário e começa por uma mensagem do usuário', () => {
    const request = parseRequest({
      message: 'Agora',
      context: 'devotional',
      conversationHistory: [
        { role: 'assistant', content: 'Pergunta inicial' },
        { role: 'user', content: 'Resposta' },
        { role: 'assistant', content: 'Outra pergunta' },
      ],
    })!;
    const messages = toAnthropicMessages(request);
    expect(messages[0].role).toBe('user');
    expect(messages[messages.length - 1]).toEqual({ role: 'user', content: 'Agora' });
    // A pergunta inicial da IA (assistant) é descartada para a lista começar por uma mensagem do usuário.
    expect(messages).toHaveLength(3);
  });

  it('detecta risco de vida e o fallback é acolhedor', () => {
    expect(detectCrisis('não quero mais viver')).toBe(true);
    expect(detectCrisis('estou cansado do trabalho')).toBe(false);
    expect(FALLBACK_TEXT).toBe('Não consegui me conectar agora. Vamos tentar de novo em um instante?');
  });
});
