import React from 'react';

import { InfoPage } from '@/components/InfoPage';

// Texto-base. Revise com assessoria jurídica (LGPD) antes de publicar nas lojas.
export default function PrivacyScreen() {
  return (
    <InfoPage
      title="Privacidade"
      intro="Suas reflexões e orações são pessoais. Aqui está, de forma simples, como cuidamos delas."
      sections={[
        {
          heading: 'O que guardamos',
          body: 'Seu nome, e-mail, o progresso da jornada, favoritos, reflexões, orações, conversas com a IA e o horário do lembrete.',
        },
        {
          heading: 'Quem pode ver',
          body: 'Somente você. Cada registro é protegido no servidor para que outra pessoa não consiga acessá-lo.',
        },
        {
          heading: 'Inteligência artificial',
          body: 'Para conversar e criar orações, o texto que você escreve é enviado com segurança ao nosso servidor, que o processa junto a um provedor de IA. Suas reflexões anteriores só são usadas se você ativar a Memória da IA em Configurações.',
        },
        {
          heading: 'Seus direitos',
          body: 'Você pode desativar a memória da IA, excluir orações e sair da conta a qualquer momento. Para excluir todos os seus dados, entre em contato pelo canal de suporte do aplicativo.',
        },
      ]}
    />
  );
}
