/**
 * Respostas simuladas (mock) da IA do SELAH.
 *
 * Usadas quando o Supabase não está configurado (modo demonstração) ou quando a
 * Edge Function `ai-chat` ainda não foi publicada. Não chamam nenhum provedor real.
 * São funções puras, por isso são facilmente testáveis.
 */
import type { AiDevotionalContext, ChatRole } from '@/types';

export type AiTask = 'chat' | 'guided_question' | 'prayer' | 'summary';

export interface AiRequestMessage {
  role: ChatRole;
  content: string;
}

export interface AiRequest {
  task: AiTask;
  messages: AiRequestMessage[];
  devotional?: AiDevotionalContext | null;
  reflection?: string;
}

export interface AiResponse {
  text: string;
  /** "crisis" quando o texto do usuário sugere risco; a UI destaca ajuda profissional. */
  flag?: 'crisis';
}

const CRISIS_PATTERNS = [
  /me matar/i,
  /suic[ií]d/i,
  /acabar com (tudo|minha vida)/i,
  /n[aã]o quero mais viver/i,
  /tirar (a )?minha vida/i,
  /me machucar/i,
  /automutila/i,
];

export function detectCrisis(text: string): boolean {
  return CRISIS_PATTERNS.some((pattern) => pattern.test(text));
}

export const CRISIS_MESSAGE =
  'Sinto muito que você esteja passando por algo tão pesado. Você não precisa enfrentar isso sozinho. ' +
  'Eu sou uma IA e não substituo ajuda humana: por favor, fale agora com alguém de confiança ou com um profissional. ' +
  'No Brasil, o CVV atende 24 horas pelo telefone 188 (ligação gratuita) ou em cvv.org.br. ' +
  'Em risco imediato, ligue 192 (SAMU) ou vá ao pronto-atendimento mais próximo.';

/** Primeiro trecho do texto do usuário, para mostrar que a resposta considera o que ele escreveu. */
export function snippetOf(text: string, max = 90): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${cut.slice(0, lastSpace > 40 ? lastSpace : max)}…`;
}

const THEMES: { pattern: RegExp; line: string }[] = [
  { pattern: /ansied|ansios|preocup|medo|inquiet/i, line: 'Percebo que há inquietação nas suas palavras, e é legítimo sentir isso.' },
  { pattern: /cansa|sobrecarreg|exaust|peso/i, line: 'Parece que você tem carregado bastante coisa, e isso cansa mesmo.' },
  { pattern: /grat|agrade|obrigad/i, line: 'Que bonito perceber gratidão no que você escreveu.' },
  { pattern: /dire[cç][aã]o|decis|caminho|escolh/i, line: 'Buscar direção é um gesto de cuidado com o próprio caminho.' },
  { pattern: /famil|filh|espos|marid|m[ãa]e|pai\b|amig/i, line: 'As pessoas ao seu redor parecem ocupar um lugar importante nisso.' },
  { pattern: /triste|sozinh|saudade|luto|perd/i, line: 'Sinto que há um peso delicado aqui, e é bom que você possa dizê-lo.' },
];

const GENERIC_QUESTIONS = [
  'O que, dessa mensagem, mais tocou você hoje?',
  'Existe alguma situação concreta do seu dia a dia em que isso se aplica?',
  'O que você sente que precisa agora: descanso, coragem, clareza ou outra coisa?',
  'Qual seria um passo pequeno e possível para hoje?',
];

const FREE_QUESTIONS = [
  'Quer me contar um pouco mais sobre isso?',
  'Como você tem se sentido em relação a isso nos últimos dias?',
  'O que você gostaria de ver diferente, ou de agradecer, dentro dessa situação?',
  'Existe algo que você queira levar em oração hoje?',
];

const OPENERS: Record<string, string> = {
  'quero refletir': 'Vamos refletir com calma. Sobre qual tema ou situação você gostaria de pensar hoje?',
  'preciso de uma oração': 'Posso ajudar a escrever uma oração com as suas palavras. Sobre o que você gostaria de orar?',
  'quero falar sobre meu dia': 'Estou aqui para ouvir. Como foi o seu dia até agora?',
  'quero entender melhor a palavra': 'Vamos olhar com cuidado. Qual passagem ou tema você quer entender melhor?',
  'quero agradecer': 'Agradecer faz bem. Pelo que você gostaria de agradecer hoje?',
  'quero pedir direção': 'Pedir direção é um ato de humildade. Qual decisão ou situação está diante de você?',
};

function lastUserText(messages: AiRequestMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === 'user') return messages[i].content;
  }
  return '';
}

function themeLine(text: string): string | null {
  return THEMES.find((t) => t.pattern.test(text))?.line ?? null;
}

function acknowledge(text: string): string {
  return themeLine(text) ?? `Obrigado por compartilhar: "${snippetOf(text)}"`;
}

function chatReply(req: AiRequest): AiResponse {
  const last = lastUserText(req.messages);
  if (detectCrisis(last)) return { text: CRISIS_MESSAGE, flag: 'crisis' };

  const userTurns = req.messages.filter((m) => m.role === 'user').length;
  const opener = OPENERS[last.trim().toLowerCase().replace(/[.!?]+$/, '')];
  if (opener && userTurns === 1) return { text: opener };

  const questions = req.devotional?.reflection_questions.length ? req.devotional.reflection_questions : null;
  const pool = questions ?? (req.devotional ? GENERIC_QUESTIONS : FREE_QUESTIONS);
  // No devocional a pergunta 0 já foi feita pela reflexão guiada; na conversa livre começamos do zero.
  const question = pool[(req.devotional ? userTurns : userTurns - 1) % pool.length];

  const lines = [acknowledge(last), question];
  if (req.devotional && userTurns >= 3) {
    lines.push('Quando sentir que é suficiente, podemos seguir para a oração, com as suas próprias palavras.');
  }
  return { text: lines.join('\n\n') };
}

function guidedQuestion(req: AiRequest): AiResponse {
  const reflection = req.reflection ?? lastUserText(req.messages);
  if (reflection && detectCrisis(reflection)) return { text: CRISIS_MESSAGE, flag: 'crisis' };
  const title = req.devotional?.title;
  const question =
    req.devotional?.reflection_questions[0] ?? 'O que, dessa mensagem, mais tocou você hoje?';
  const intro = reflection
    ? `Li o que você escreveu: "${snippetOf(reflection)}"${themeLine(reflection) ? `\n\n${themeLine(reflection)}` : ''}`
    : `Vamos conversar sobre${title ? ` "${title}"` : ' o que você leu'}.`;
  return { text: `${intro}\n\n${question}` };
}

function prayer(req: AiRequest): AiResponse {
  const userText = [req.reflection, ...req.messages.filter((m) => m.role === 'user').map((m) => m.content)]
    .filter((t): t is string => Boolean(t && t.trim()))
    .join(' ');
  if (detectCrisis(userText)) return { text: CRISIS_MESSAGE, flag: 'crisis' };

  const lines: string[] = ['Pai,', '', 'Eu chego diante de Ti como estou hoje, com o coração aberto.'];
  if (req.reflection?.trim()) lines.push('', `Eu pensei sobre isto: "${snippetOf(req.reflection, 160)}".`);
  const chatTexts = req.messages.filter((m) => m.role === 'user').map((m) => m.content);
  if (chatTexts.length > 0) lines.push(`Também compartilhei: "${snippetOf(chatTexts[chatTexts.length - 1], 120)}".`);
  // A oração usa SOMENTE o que o usuário compartilhou (nada do texto do devocional).
  lines.push(
    '',
    'Peço serenidade para o dia de hoje, clareza para o próximo passo e um coração atento às pessoas ao meu redor.',
    '',
    'Amém.',
  );
  return { text: lines.join('\n') };
}

function summary(req: AiRequest): AiResponse {
  const parts: string[] = [];
  if (req.devotional) parts.push(`Hoje você refletiu sobre "${req.devotional.title}" (${req.devotional.verse_reference}).`);
  if (req.reflection?.trim()) parts.push(`Você trouxe: "${snippetOf(req.reflection, 140)}".`);
  if (req.devotional?.highlight_phrase) parts.push(`Para levar: ${req.devotional.highlight_phrase}`);
  return { text: parts.join(' ') || 'Um momento de pausa e reflexão.' };
}

export function mockComplete(req: AiRequest): AiResponse {
  switch (req.task) {
    case 'guided_question':
      return guidedQuestion(req);
    case 'prayer':
      return prayer(req);
    case 'summary':
      return summary(req);
    default:
      return chatReply(req);
  }
}
