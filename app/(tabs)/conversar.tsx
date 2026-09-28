import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { AIChat } from '@/components/AIChat';
import { Button } from '@/components/Button';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { uid } from '@/lib/id';
import { sendChatMessage } from '@/services/aiService';
import { saveConversation } from '@/services/data';
import type { ChatMessage } from '@/types';

const SUGGESTIONS = [
  'Quero refletir',
  'Preciso de uma oração',
  'Quero falar sobre meu dia',
  'Quero entender melhor a Palavra',
  'Quero agradecer',
  'Quero pedir direção',
];

function message(role: ChatMessage['role'], content: string): ChatMessage {
  return { id: uid(), role, content, created_at: new Date().toISOString() };
}

export default function TalkScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const conversationId = useRef<string | null>(null);

  const send = useCallback(
    async (text: string) => {
      const history = [...messages, message('user', text)];
      setMessages(history);
      setSending(true);
      let finalHistory = history;
      try {
        const reply = await sendChatMessage(history);
        finalHistory = [...history, message('assistant', reply.text)];
      } catch {
        finalHistory = [
          ...history,
          message('assistant', 'Não consegui responder agora. Vamos tentar de novo em instantes?'),
        ];
      }
      setMessages(finalHistory);
      setSending(false);
      saveConversation({
        conversationId: conversationId.current,
        devotionalId: null,
        context: 'livre',
        messages: finalHistory,
      })
        .then((id) => {
          conversationId.current = id;
        })
        .catch((error) => console.warn('[chat] não foi possível salvar a conversa', error));
    },
    [messages],
  );

  const reset = () => {
    conversationId.current = null;
    setMessages([]);
  };

  return (
    <Screen scroll={false}>
      {messages.length > 0 ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12 }}>
          <Text variant="heading" accessibilityRole="header">
            Conversar
          </Text>
          <Button title="Nova conversa" variant="ghost" fullWidth={false} onPress={reset} />
        </View>
      ) : (
        <View style={{ height: 24 }} />
      )}
      <AIChat
        messages={messages}
        onSend={(text) => void send(text)}
        sending={sending}
        suggestions={SUGGESTIONS}
        emptyTitle="Estou aqui para ouvir."
        emptySubtitle="Você pode conversar sobre o que está vivendo."
      />
    </Screen>
  );
}
