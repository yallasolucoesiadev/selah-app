import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { View } from 'react-native';

import { AIStep } from '@/components/devotional/AIStep';
import { MomentStep } from '@/components/devotional/MomentStep';
import { PauseStep } from '@/components/devotional/PauseStep';
import { PrayerStep } from '@/components/devotional/PrayerStep';
import { ReflectionStep } from '@/components/devotional/ReflectionStep';
import { WordStep } from '@/components/devotional/WordStep';
import { Button } from '@/components/Button';
import { CupSteam } from '@/components/CupSteam';
import { FadeIn } from '@/components/FadeIn';
import { Header } from '@/components/Header';
import { ProgressBar } from '@/components/ProgressBar';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useJourney } from '@/hooks/useJourney';
import { uid } from '@/lib/id';
import { generatePrayer, getGuidedQuestion, sendChatMessage, summarizeMoment } from '@/services/aiService';
import { saveConversation, savePrayer, saveReflection } from '@/services/data';
import type { ChatMessage } from '@/types';

const STEPS = ['Pausa', 'Palavra', 'Reflexão', 'Conversa', 'Oração', 'Meu momento'];
const DONE = STEPS.length;

function msg(role: ChatMessage['role'], content: string): ChatMessage {
  return { id: uid(), role, content, created_at: new Date().toISOString() };
}

export default function DevotionalFlowScreen() {
  const router = useRouter();
  const { day } = useLocalSearchParams<{ day: string }>();
  const journey = useJourney();
  const devotional = journey.devotionals.find((d) => d.day_number === Number(day)) ?? null;

  const [step, setStep] = useState(0);
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [prayer, setPrayer] = useState<string | null>(null);
  const [prayerSaved, setPrayerSaved] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [prayerError, setPrayerError] = useState<string | null>(null);
  const [takeaway, setTakeaway] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const conversationId = useRef<string | null>(null);

  const persistConversation = useCallback(
    (history: ChatMessage[]) => {
      if (!devotional) return;
      saveConversation({
        conversationId: conversationId.current,
        devotionalId: devotional.id,
        context: 'devotional',
        messages: history,
      })
        .then((id) => {
          conversationId.current = id;
        })
        .catch((error) => console.warn('[devocional] não foi possível salvar a conversa', error));
    },
    [devotional],
  );

  // Resumo pessoal (montado no aparelho) para a última etapa.
  const summary = devotional && step === 5 ? summarizeMoment(devotional, reflection).text : null;

  if (journey.loading) {
    return (
      <Screen>
        <Header close />
        <Text tone="muted">Preparando seu momento…</Text>
      </Screen>
    );
  }

  if (!devotional) {
    return (
      <Screen>
        <Header close />
        <View style={{ gap: 16 }}>
          <Text variant="title">Este dia ainda não está disponível.</Text>
          <Button title="Voltar" onPress={() => router.back()} />
        </View>
      </Screen>
    );
  }

  const submitReflection = async () => {
    setBusy(true);
    try {
      await saveReflection(devotional.id, reflection);
      setReflectionSaved(true);
    } catch (error) {
      console.warn('[devocional] reflexão será salva ao final', error);
    }
    let first: ChatMessage;
    try {
      const reply = await getGuidedQuestion(devotional, reflection);
      first = msg('assistant', reply.text);
    } catch {
      first = msg('assistant', 'Obrigado por compartilhar. O que, dessa mensagem, mais tocou você hoje?');
    }
    const history = [first];
    setMessages(history);
    persistConversation(history);
    setBusy(false);
    setStep(3);
  };

  const sendMessage = async (text: string) => {
    const history = [...messages, msg('user', text)];
    setMessages(history);
    setSending(true);
    let final: ChatMessage[];
    try {
      const reply = await sendChatMessage(history, devotional);
      final = [...history, msg('assistant', reply.text)];
    } catch {
      final = [...history, msg('assistant', 'Não consegui responder agora. Quer tentar de novo em instantes?')];
    }
    setMessages(final);
    setSending(false);
    persistConversation(final);
  };

  const createPrayer = async () => {
    setGenerating(true);
    setPrayerError(null);
    const reply = await generatePrayer(reflection, messages);
    if (reply.fallback) {
      // A mensagem de contingência não é uma oração: não vira texto salvável.
      setPrayerError(reply.text);
    } else {
      setPrayer(reply.text);
      setPrayerSaved(false);
    }
    setGenerating(false);
  };

  const keepPrayer = async () => {
    if (!prayer || prayerSaved) return;
    try {
      await savePrayer(devotional.id, prayer);
      setPrayerSaved(true);
    } catch (error) {
      console.warn('[devocional] não foi possível salvar a oração', error);
    }
  };

  const saveMoment = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      if (!reflectionSaved) {
        await saveReflection(devotional.id, reflection);
        setReflectionSaved(true);
      }
      if (takeaway.trim()) await saveReflection(devotional.id, `Para levar ao meu dia: ${takeaway.trim()}`);
      await journey.markCompleted(devotional);
      setStep(DONE);
    } catch {
      setSaveError('Não foi possível salvar agora. Verifique sua conexão e tente de novo.');
    } finally {
      setSaving(false);
    }
  };

  const finished = step === DONE;

  return (
    <Screen scroll={false} edges={['top', 'bottom', 'left', 'right']}>
      <Header close />
      {!finished ? (
        <View style={{ gap: 8, paddingBottom: 16 }}>
          <Text variant="overline" tone="muted">
            Etapa {step + 1} de {STEPS.length} · {STEPS[step]}
          </Text>
          <ProgressBar value={(step + 1) / STEPS.length} height={5} label="Etapas do momento" />
        </View>
      ) : null}

      <FadeIn key={step} style={{ flex: 1 }}>
        {step === 0 && <PauseStep onNext={() => setStep(1)} />}
        {step === 1 && (
          <WordStep
            devotional={devotional}
            favorite={journey.favoriteIds.has(devotional.id)}
            onToggleFavorite={() => void journey.toggleFavorite(devotional)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <ReflectionStep devotional={devotional} value={reflection} onChange={setReflection} onNext={() => void submitReflection()} busy={busy} />
        )}
        {step === 3 && <AIStep messages={messages} sending={sending} onSend={(t) => void sendMessage(t)} onNext={() => setStep(4)} />}
        {step === 4 && (
          <PrayerStep
            prayer={prayer}
            saved={prayerSaved}
            generating={generating}
            error={prayerError}
            onGenerate={() => void createPrayer()}
            onSave={() => void keepPrayer()}
            onNext={() => setStep(5)}
          />
        )}
        {step === 5 && (
          <MomentStep
            summary={summary}
            hasPrayer={Boolean(prayer)}
            takeaway={takeaway}
            onTakeawayChange={setTakeaway}
            onSave={() => void saveMoment()}
            saving={saving}
            error={saveError}
          />
        )}
        {finished && (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <CupSteam size={64} />
            <Text variant="display" align="center" accessibilityRole="header">
              Momento salvo.
            </Text>
            <Text variant="bodyLarge" tone="muted" align="center">
              Que essa pausa acompanhe o seu dia.
            </Text>
            <View style={{ alignSelf: 'stretch', gap: 8, marginTop: 16 }}>
              {devotional.challenge_text ? (
                <Button
                  title="Ver desafio de hoje"
                  onPress={() => router.replace({ pathname: '/desafio', params: { devotionalId: devotional.id } })}
                />
              ) : null}
              <Button
                title="Voltar ao início"
                variant={devotional.challenge_text ? 'secondary' : 'primary'}
                onPress={() => router.replace('/')}
              />
            </View>
          </View>
        )}
      </FadeIn>
    </Screen>
  );
}
