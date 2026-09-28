import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { isVoiceInputSupported, startVoiceInput, VoiceSession } from '@/services/speechService';
import { Button } from './Button';
import { Sheet } from './Sheet';
import { Text } from './Text';

interface VoiceButtonProps {
  /** Recebe o texto ditado para acrescentar ao campo. */
  onText: (text: string) => void;
}

export function VoiceButton({ onText }: VoiceButtonProps) {
  const { colors } = useTheme();
  const [listening, setListening] = useState(false);
  const [hint, setHint] = useState(false);
  const session = useRef<VoiceSession | null>(null);

  useEffect(() => () => session.current?.stop(), []);

  const toggle = () => {
    if (listening) {
      session.current?.stop();
      return;
    }
    if (!isVoiceInputSupported()) {
      setHint(true);
      return;
    }
    session.current = startVoiceInput({
      onText,
      onEnd: () => setListening(false),
    });
    setListening(Boolean(session.current));
  };

  return (
    <>
      <Pressable
        onPress={toggle}
        accessibilityRole="button"
        accessibilityLabel={listening ? 'Parar ditado por voz' : 'Ditar por voz'}
        accessibilityState={{ selected: listening }}
        style={{
          width: MIN_TOUCH,
          height: MIN_TOUCH,
          borderRadius: MIN_TOUCH,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: listening ? colors.gold : colors.surfaceAlt,
        }}
      >
        <Ionicons name={listening ? 'stop' : 'mic-outline'} size={22} color={listening ? colors.onGold : colors.text} />
      </Pressable>
      <Sheet visible={hint} onClose={() => setHint(false)} title="Falar em vez de digitar">
        <Text tone="muted" style={{ marginBottom: 16 }}>
          Toque no ícone de microfone do teclado do seu celular para ditar. O reconhecimento de voz integrado ao SELAH
          chegará em uma próxima versão.
        </Text>
        <Button title="Entendi" onPress={() => setHint(false)} />
      </Sheet>
    </>
  );
}
