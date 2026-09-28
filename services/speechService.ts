import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

/** Leitura em voz alta (texto para fala) com expo-speech. */
export function speak(text: string, onDone?: () => void) {
  Speech.stop();
  Speech.speak(text, {
    language: 'pt-BR',
    rate: 0.92,
    onDone,
    onStopped: onDone,
    onError: onDone,
  });
}

export function stopSpeaking() {
  Speech.stop();
}

// ---------------------------------------------------------------------------
// Ditado por voz (fala para texto)
// ---------------------------------------------------------------------------
// O Expo não inclui reconhecimento de voz nativo. Na web usamos a Web Speech API.
// No celular, o ditado do teclado (ícone de microfone) já funciona nos campos de texto;
// um reconhecedor nativo dedicado pode ser plugado aqui no futuro (recurso Premium: "voz").

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type RecognitionCtor = new () => SpeechRecognitionLike;

function getRecognitionCtor(): RecognitionCtor | null {
  if (Platform.OS !== 'web') return null;
  const g = globalThis as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return g.SpeechRecognition ?? g.webkitSpeechRecognition ?? null;
}

export function isVoiceInputSupported(): boolean {
  return getRecognitionCtor() !== null;
}

export interface VoiceSession {
  stop: () => void;
}

export function startVoiceInput(handlers: {
  onText: (text: string) => void;
  onEnd: () => void;
}): VoiceSession | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const recognition = new Ctor();
  recognition.lang = 'pt-BR';
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.onresult = (event) => {
    const parts: string[] = [];
    for (let i = 0; i < event.results.length; i++) parts.push(event.results[i][0].transcript);
    handlers.onText(parts.join(' ').trim());
  };
  recognition.onend = handlers.onEnd;
  recognition.onerror = handlers.onEnd;
  recognition.start();
  return { stop: () => recognition.stop() };
}
