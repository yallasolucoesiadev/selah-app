import type { Devotional } from '@/types';

/**
 * CONTEÚDO DE EXEMPLO (placeholder).
 *
 * Textos genéricos, escritos apenas para que o app funcione de ponta a ponta.
 * NÃO são o conteúdo do devocional "Café com Deus Pai" nem de qualquer obra protegida.
 * O conteúdo autorizado deve ser inserido na tabela `devotionals` do Supabase.
 * Versículos: Almeida Corrigida Fiel (domínio público).
 *
 * Este arquivo é usado no modo demonstração (sem Supabase configurado).
 * O mesmo conteúdo está em supabase/migrations/0002_seed_placeholder.sql.
 */
export const PLACEHOLDER_DEVOTIONALS: Devotional[] = [
  {
    id: 'demo-devotional-1',
    day_number: 1,
    date: null,
    title: 'Aquietar o coração',
    verse_text: 'Aquietai-vos, e sabei que eu sou Deus.',
    verse_reference: 'Salmos 46:10',
    content:
      '[CONTEÚDO DE EXEMPLO]\n\nHá dias em que o barulho de fora é o menor problema: o que pesa é o barulho de dentro. Pensamentos que correm, listas que não terminam, preocupações que chegam antes da hora.\n\nEste é um texto de exemplo para mostrar como a leitura aparece no app. Aqui entrará o conteúdo devocional autorizado. Por ora, fique com uma ideia simples: parar por alguns instantes também é uma forma de cuidar da alma.\n\nRespire fundo. Não há pressa neste momento.',
    highlight_phrase: 'Parar por alguns instantes também é uma forma de cuidar da alma.',
    reflection_prompt: 'O que está mais barulhento dentro de você hoje?',
    challenge_text: 'Ofereça cinco minutos de silêncio e atenção total a alguém da sua casa, sem celular por perto.',
    audio_url: null,
    reflection_questions: [
      'O que está ocupando mais espaço na sua mente neste momento?',
      'Em que momento do seu dia você consegue, de verdade, ficar em silêncio?',
      'O que mudaria se você reservasse alguns minutos de quietude por dia?',
    ],
  },
  {
    id: 'demo-devotional-2',
    day_number: 2,
    date: null,
    title: 'Descansar sem culpa',
    verse_text: 'Vinde a mim, todos os que estais cansados e oprimidos, e eu vos aliviarei.',
    verse_reference: 'Mateus 11:28',
    content:
      '[CONTEÚDO DE EXEMPLO]\n\nCansaço nem sempre é falta de sono. Às vezes é excesso de tentativa de dar conta de tudo sozinho.\n\nEste é um texto genérico de exemplo, escrito só para o app funcionar. O devocional real será carregado do Supabase. A ideia por trás dele: descansar não é fraqueza, e pedir ajuda também faz parte da caminhada.',
    highlight_phrase: 'Descansar não é fraqueza.',
    reflection_prompt: 'Onde você tem carregado peso demais sozinho?',
    challenge_text: 'Pergunte a alguém próximo: "Como posso te ajudar hoje?" e escute a resposta com atenção.',
    audio_url: null,
    reflection_questions: [
      'Que peso você tem carregado por conta própria?',
      'O que te impede de pedir ajuda ou de descansar?',
      'Como seria um descanso de verdade para você esta semana?',
    ],
  },
  {
    id: 'demo-devotional-3',
    day_number: 3,
    date: null,
    title: 'Confiar no caminho',
    verse_text: 'Confia no Senhor de todo o teu coração, e não te estribes no teu próprio entendimento.',
    verse_reference: 'Provérbios 3:5',
    content:
      '[CONTEÚDO DE EXEMPLO]\n\nNem sempre entendemos o desenho completo da estrada. Muitas vezes só enxergamos o próximo passo.\n\nTexto de exemplo para demonstração. Aqui entrará o conteúdo devocional autorizado. Por enquanto, a mensagem é curta: dê o passo que está ao seu alcance hoje, e deixe o restante para o dia de amanhã.',
    highlight_phrase: 'Dê o passo que está ao seu alcance hoje.',
    reflection_prompt: 'Qual é o próximo passo pequeno que você já sabe que precisa dar?',
    challenge_text: 'Envie uma mensagem de incentivo a alguém que está enfrentando uma decisão difícil.',
    audio_url: null,
    reflection_questions: [
      'Em que área da vida você mais quer ver o caminho inteiro antes de andar?',
      'Qual é o próximo passo pequeno que você já sabe que precisa dar?',
      'O que te ajudaria a confiar um pouco mais nesse processo?',
    ],
  },
  {
    id: 'demo-devotional-4',
    day_number: 4,
    date: null,
    title: 'Gratidão que enxerga',
    verse_text:
      'Não estejais inquietos por coisa alguma; antes as vossas petições sejam em tudo conhecidas diante de Deus pela oração e súplicas, com ação de graças.',
    verse_reference: 'Filipenses 4:6',
    content:
      '[CONTEÚDO DE EXEMPLO]\n\nGratidão é um jeito de olhar. Quando aprendemos a notar o que já recebemos, a ansiedade perde um pouco do território.\n\nEste texto é apenas ilustrativo. O devocional real virá do Supabase. Experimente hoje listar mentalmente três coisas simples pelas quais você é grato.',
    highlight_phrase: 'Gratidão é um jeito de olhar.',
    reflection_prompt: 'Que três coisas simples você quer agradecer hoje?',
    challenge_text: 'Escreva um bilhete curto de agradecimento a alguém que fez diferença na sua semana.',
    audio_url: null,
    reflection_questions: [
      'Pelo que você é grato hoje, mesmo que seja algo pequeno?',
      'O que costuma roubar sua atenção do que já é bom?',
      'Como você poderia expressar sua gratidão a alguém hoje?',
    ],
  },
  {
    id: 'demo-devotional-5',
    day_number: 5,
    date: null,
    title: 'Amar com atitudes',
    verse_text: 'Nós o amamos a ele, porque ele nos amou primeiro.',
    verse_reference: '1 João 4:19',
    content:
      '[CONTEÚDO DE EXEMPLO]\n\nAmar não é apenas sentir: é escolher, de novo e de novo, agir com cuidado.\n\nTexto de exemplo, escrito só para demonstrar o app. O conteúdo devocional autorizado será inserido depois. A ideia central aqui: pequenos gestos de atenção valem mais do que grandes discursos.',
    highlight_phrase: 'Pequenos gestos de atenção valem mais do que grandes discursos.',
    reflection_prompt: 'Que gesto simples de cuidado você pode oferecer hoje?',
    challenge_text: 'Faça algo gentil por alguém sem esperar nada em troca e sem contar a ninguém.',
    audio_url: null,
    reflection_questions: [
      'Quem precisa da sua atenção ou do seu cuidado nesta semana?',
      'O que costuma te impedir de demonstrar carinho com atitudes?',
      'Que gesto simples você pode fazer ainda hoje?',
    ],
  },
];
