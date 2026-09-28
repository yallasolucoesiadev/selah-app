import React from 'react';
import { View } from 'react-native';

import { AIChat } from '@/components/AIChat';
import { Button } from '@/components/Button';
import type { ChatMessage } from '@/types';

interface AIStepProps {
  messages: ChatMessage[];
  sending: boolean;
  onSend: (text: string) => void;
  onNext: () => void;
}

export function AIStep({ messages, sending, onSend, onNext }: AIStepProps) {
  const hasReplied = messages.some((m) => m.role === 'user');
  return (
    <View style={{ flex: 1 }}>
      <AIChat messages={messages} onSend={onSend} sending={sending} placeholder="Responda com suas palavras…" />
      <Button title="Seguir para a oração" variant={hasReplied ? 'primary' : 'secondary'} onPress={onNext} />
    </View>
  );
}
