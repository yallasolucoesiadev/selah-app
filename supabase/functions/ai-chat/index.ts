// Edge Function `ai-chat` — ponte segura entre o app SELAH e o provedor de IA.
//
// Por que existe: a chave do provedor de IA NUNCA pode ficar no app. Ela vive como secret aqui:
//   supabase secrets set AI_API_KEY=... AI_PROVIDER=...
// Deploy: supabase functions deploy ai-chat   (verify_jwt ligado por padrão: só usuários logados)
//
// Toda validação é feita aqui (tamanho, tarefa, memória), nunca só no cliente.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type Task = 'chat' | 'guided_question' | 'prayer' | 'summary';
interface Msg {
  role: 'user' | 'assistant';
  content: string;
}
interface Devotional {
  title: string;
  verse_reference: string;
  verse_text: string;
  highlight_phrase: string | null;
  reflection_questions: string[];
}

const TASKS: Task[] = ['chat', 'guided_question', 'prayer', 'summary'];
const MAX_MESSAGES = 30;
const MAX_CHARS = 4000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Prompt interno: fica somente no servidor e nunca é devolvido ao cliente.
const SYSTEM_PROMPT = `Você é a companheira de reflexão do app SELAH.
Tom: acolhedora, serena, respeitosa, inteligente, não julgadora; espiritual sem ser invasiva.
Regras invioláveis:
- Nunca finja ser Deus, nunca diga que é Deus, nunca afirme revelação divina.
- Você não substitui pastor, psicólogo ou médico; se houver sofrimento intenso ou risco, incentive buscar ajuda humana (no Brasil, CVV 188).
- Nunca invente versículos. Ao citar a Bíblia, identifique corretamente a referência. Se não tiver certeza, não cite.
- Diferencie claramente: conteúdo bíblico, interpretação e reflexão gerada por IA.
- Faça UMA pergunta por vez e considere sempre a resposta anterior. Nunca seja genérica.
- Orações: escreva em primeira pessoa, baseadas SOMENTE no que o usuário compartilhou, e nunca as apresente como mensagem recebida de Deus.
Responda em português do Brasil, com poucos parágrafos curtos.`;

const CRISIS = /(me matar|suic[ií]d|acabar com (tudo|minha vida)|n[aã]o quero mais viver|tirar (a )?minha vida)/i;
const CRISIS_TEXT =
  'Sinto muito que você esteja passando por algo tão pesado. Você não precisa enfrentar isso sozinho. ' +
  'Sou uma IA e não substituo ajuda humana: fale agora com alguém de confiança ou com um profissional. ' +
  'No Brasil, o CVV atende 24 horas pelo 188 (ligação gratuita). Em risco imediato, ligue 192 (SAMU).';

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function validate(body: unknown): { task: Task; messages: Msg[]; devotional: Devotional | null; reflection: string } | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  if (!TASKS.includes(b.task as Task)) return null;
  const rawMessages = Array.isArray(b.messages) ? b.messages : [];
  if (rawMessages.length > MAX_MESSAGES) return null;
  const messages: Msg[] = [];
  for (const m of rawMessages) {
    const item = m as Record<string, unknown>;
    if ((item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') return null;
    messages.push({ role: item.role, content: item.content.slice(0, MAX_CHARS) });
  }
  const reflection = typeof b.reflection === 'string' ? b.reflection.slice(0, MAX_CHARS) : '';
  const devotional = b.devotional && typeof b.devotional === 'object' ? (b.devotional as Devotional) : null;
  return { task: b.task as Task, messages, devotional, reflection };
}

/**
 * TODO(provedor): chamada real ao provedor de IA.
 *
 * Coloque aqui a chamada ao provedor escolhido usando a chave do secret:
 *   const apiKey = Deno.env.get('AI_API_KEY');   // <-- a chave entra AQUI, só no backend
 *   const reply = await fetch('<endpoint do provedor>', { headers: { Authorization: `Bearer ${apiKey}` }, ... });
 * Envie `SYSTEM_PROMPT`, o contexto do devocional, `memory` (se houver) e `messages`.
 *
 * Por enquanto devolve uma resposta simulada para o fluxo funcionar de ponta a ponta.
 */
// deno-lint-ignore require-await
async function callProvider(input: {
  task: Task;
  messages: Msg[];
  devotional: Devotional | null;
  reflection: string;
  memory: string[];
  system: string;
}): Promise<string> {
  const lastUser = [...input.messages].reverse().find((m) => m.role === 'user')?.content ?? input.reflection;
  const snippet = lastUser.replace(/\s+/g, ' ').trim().slice(0, 90);
  if (input.task === 'prayer') {
    return `Pai,\n\nEu chego diante de Ti como estou hoje.\n\nEu pensei sobre isto: "${snippet}".\n\nPeço serenidade e clareza para o próximo passo.\n\nAmém.`;
  }
  if (input.task === 'summary') return `Você refletiu sobre: "${snippet}".`;
  const question =
    input.devotional?.reflection_questions?.[0] ?? 'O que, dessa mensagem, mais tocou você hoje?';
  return `[resposta simulada — configure o provedor de IA] Obrigado por compartilhar: "${snippet}"\n\n${question}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  // Cliente com o JWT do usuário: todas as consultas abaixo respeitam RLS.
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) return json({ error: 'unauthorized' }, 401);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'invalid_json' }, 400);
  }
  const input = validate(body);
  if (!input) return json({ error: 'invalid_request' }, 400);

  const userText = [input.reflection, ...input.messages.filter((m) => m.role === 'user').map((m) => m.content)].join(' ');
  if (CRISIS.test(userText)) return json({ text: CRISIS_TEXT, flag: 'crisis' });

  // Memória: só é usada se o USUÁRIO ativou (verificado aqui no servidor, nunca confiando no app).
  let memory: string[] = [];
  const { data: setting } = await supabase
    .from('ai_memory_settings')
    .select('memory_enabled')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (setting?.memory_enabled) {
    const { data: rows } = await supabase
      .from('reflections')
      .select('content')
      .order('created_at', { ascending: false })
      .limit(5);
    memory = (rows ?? []).map((r: { content: string }) => String(r.content).slice(0, 400));
  }

  try {
    const text = await callProvider({ ...input, memory, system: SYSTEM_PROMPT });
    return json({ text });
  } catch (error) {
    console.error('ai-chat provider error', error);
    return json({ error: 'provider_error' }, 502);
  }
});
