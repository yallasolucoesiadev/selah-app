import { CRISIS_MESSAGE, detectCrisis, mockComplete, snippetOf } from '@/services/aiMock';

const devotional = {
  title: 'Aquietar o coração',
  verse_reference: 'Salmos 46:10',
  verse_text: 'Aquietai-vos, e sabei que eu sou Deus.',
  highlight_phrase: 'Parar também é cuidar da alma.',
  reflection_questions: ['Pergunta A?', 'Pergunta B?', 'Pergunta C?'],
};

describe('aiMock', () => {
  it('detecta linguagem de risco e responde com ajuda profissional (CVV 188)', () => {
    expect(detectCrisis('às vezes penso em me matar')).toBe(true);
    expect(detectCrisis('hoje foi um dia cansativo')).toBe(false);
    const reply = mockComplete({ task: 'chat', messages: [{ role: 'user', content: 'não quero mais viver' }] });
    expect(reply.flag).toBe('crisis');
    expect(reply.text).toBe(CRISIS_MESSAGE);
    expect(reply.text).toContain('188');
  });

  it('reflexão guiada considera o que o usuário escreveu e faz uma pergunta por vez', () => {
    const reply = mockComplete({
      task: 'guided_question',
      messages: [],
      devotional,
      reflection: 'Sinto ansiedade com o trabalho',
    });
    expect(reply.text).toContain('Sinto ansiedade com o trabalho');
    expect(reply.text).toContain('Pergunta A?');
    expect(reply.text.match(/\?/g)).toHaveLength(1);
  });

  it('avança nas perguntas do devocional sem repetir a anterior', () => {
    const first = mockComplete({
      task: 'chat',
      messages: [{ role: 'user', content: 'Meu trabalho' }],
      devotional,
    });
    const second = mockComplete({
      task: 'chat',
      messages: [
        { role: 'user', content: 'Meu trabalho' },
        { role: 'assistant', content: first.text },
        { role: 'user', content: 'Os prazos' },
      ],
      devotional,
    });
    expect(first.text).toContain('Pergunta B?');
    expect(second.text).toContain('Pergunta C?');
  });

  it('oração usa somente o que o usuário compartilhou e nunca se apresenta como Deus', () => {
    const { text } = mockComplete({
      task: 'prayer',
      messages: [{ role: 'user', content: 'Preciso de calma' }],
      devotional,
      reflection: 'Estou cansado',
    });
    expect(text).toContain('Estou cansado');
    expect(text).toContain('Preciso de calma');
    expect(text).not.toContain(devotional.highlight_phrase);
    expect(text).not.toMatch(/eu sou deus|assim diz o senhor|deus diz|deus te diz/i);
    expect(text.trim().endsWith('Amém.')).toBe(true);
  });

  it('snippetOf encurta textos longos sem cortar palavras', () => {
    const long = 'palavra '.repeat(40);
    const out = snippetOf(long, 50);
    expect(out.length).toBeLessThanOrEqual(51);
    expect(out.endsWith('…')).toBe(true);
    expect(snippetOf('curto')).toBe('curto');
  });
});
