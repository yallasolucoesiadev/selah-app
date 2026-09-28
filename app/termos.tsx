import React from 'react';

import { InfoPage } from '@/components/InfoPage';

// Texto-base. Revise com assessoria jurídica antes de publicar nas lojas.
export default function TermsScreen() {
  return (
    <InfoPage
      title="Termos de uso"
      sections={[
        {
          heading: 'Sobre o SELAH',
          body: 'O SELAH oferece um momento diário de leitura, reflexão e oração, com apoio de inteligência artificial como companhia de reflexão.',
        },
        {
          heading: 'A IA não é Deus',
          body: 'As respostas e orações geradas por IA são reflexões produzidas a partir do que você compartilha. Não são mensagens de Deus, revelação divina, aconselhamento pastoral, psicológico ou médico.',
        },
        {
          heading: 'Situações de sofrimento',
          body: 'Se você estiver em sofrimento intenso, procure um profissional ou alguém de confiança. No Brasil, o CVV atende 24 horas pelo telefone 188.',
        },
        {
          heading: 'Conteúdo',
          body: 'Os textos devocionais são de seus respectivos autores e usados com autorização. É proibido copiar ou redistribuir o conteúdo do aplicativo.',
        },
      ]}
    />
  );
}
