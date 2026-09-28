// Edge Function `ai-chat` — ponte segura entre o app SELAH e a API da Anthropic (Claude).
//
// A chave NUNCA fica no app: ela vive como secret desta função.
//   supabase secrets set ANTHROPIC_API_KEY=...            (obrigatório)
//   supabase secrets set ANTHROPIC_MODEL=claude-sonnet-5   (opcional; este é o padrão)
//   supabase functions deploy ai-chat                      (verify_jwt ligado: só usuários logados)
//
// Toda validação acontece aqui (formato, tamanho, memória do usuário), nunca só no app.
// Falhas do provedor devolvem uma mensagem acolhedora em vez de erro, para não quebrar a tela.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

import {
  buildSystemPrompt,
  CRISIS_TEXT,
  detectCrisis,
  FALLBACK_TEXT,
  parseRequest,
  toAnthropicMessages,
} from './prompt.ts';

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-5';
const TIMEOUT_MS = 25_000;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

/** Resposta amigável quando a IA não está disponível. `error` é só um código para logs/diagnóstico. */
function fallback(error: string) {
  return json({ text: FALLBACK_TEXT, fallback: true, error });
}

async function callClaude(input: { system: string; messages: { role: string; content: string }[]; context: string }) {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY');
  if (!apiKey) {
    console.error('[ai-chat] ANTHROPIC_API_KEY não configurada. Rode: supabase secrets set ANTHROPIC_API_KEY=...');
    return { error: 'ai_not_configured' as const };
  }

  let response: Response;
  try {
    response = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: Deno.env.get('ANTHROPIC_MODEL') || DEFAULT_MODEL,
        // Respostas curtas (2-4 frases); a oração é um pouco maior.
        max_tokens: input.context === 'oracao' ? 700 : 500,
        // Conversa curta e de baixa latência: sem raciocínio estendido.
        thinking: { type: 'disabled' },
        system: input.system,
        messages: input.messages,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (cause) {
    console.error('[ai-chat] falha de rede/timeout ao chamar a Anthropic', cause instanceof Error ? cause.name : cause);
    return { error: 'provider_unreachable' as const };
  }

  if (!response.ok) {
    // Registra status e tipo do erro, nunca a chave nem o conteúdo da conversa.
    let type = 'unknown';
    try {
      type = (await response.json())?.error?.type ?? type;
    } catch {
      /* corpo não era JSON */
    }
    console.error(`[ai-chat] Anthropic respondeu ${response.status} (${type})`);
    return { error: response.status === 401 ? ('ai_auth_failed' as const) : ('provider_error' as const) };
  }

  const data = await response.json();
  if (data?.stop_reason === 'refusal') return { error: 'provider_refusal' as const };
  const text = Array.isArray(data?.content)
    ? data.content
        .filter((block: { type: string }) => block.type === 'text')
        .map((block: { text: string }) => block.text)
        .join('\n')
        .trim()
    : '';
  return text ? { text } : { error: 'empty_response' as const };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json({ error: 'unauthorized' }, 401);

  // Cliente com o JWT do usuário: as consultas abaixo respeitam RLS.
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
  const request = parseRequest(body);
  if (!request) return json({ error: 'invalid_request' }, 400);

  // Rede de segurança determinística para risco de vida (não depende da IA estar no ar).
  const userText = [request.message, ...request.conversationHistory.filter((m) => m.role === 'user').map((m) => m.content)].join(' ');
  if (detectCrisis(userText)) return json({ text: CRISIS_TEXT, flag: 'crisis' });

  // Memória: só se o USUÁRIO ativou (verificado aqui, nunca confiando no app).
  let memory: string[] = [];
  try {
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
  } catch (cause) {
    console.error('[ai-chat] não foi possível ler a memória do usuário', cause);
  }

  const result = await callClaude({
    system: buildSystemPrompt({ context: request.context, devotionalContent: request.devotionalContent, memory }),
    messages: toAnthropicMessages(request),
    context: request.context,
  });

  if ('error' in result) return fallback(result.error);
  return json({ text: result.text });
});
