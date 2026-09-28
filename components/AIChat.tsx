import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';

import { fonts } from '@/constants/typography';
import { MIN_TOUCH } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { AI_DISCLAIMER } from '@/services/aiService';
import type { ChatMessage } from '@/types';
import { Chip } from './Chip';
import { Text } from './Text';
import { VoiceButton } from './VoiceButton';

interface AIChatProps {
  messages: ChatMessage[];
  onSend: (text: string) => void;
  sending?: boolean;
  suggestions?: string[];
  placeholder?: string;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function AIChat({
  messages,
  onSend,
  sending = false,
  suggestions,
  placeholder = 'Escreva ou fale o que está no seu coração…',
  emptyTitle,
  emptySubtitle,
}: AIChatProps) {
  const { colors, fontScale } = useTheme();
  const [draft, setDraft] = useState('');
  const scroller = useRef<ScrollView>(null);

  useEffect(() => {
    const timer = setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 60);
    return () => clearTimeout(timer);
  }, [messages.length, sending]);

  const submit = (text: string) => {
    const value = text.trim();
    if (!value || sending) return;
    setDraft('');
    onSend(value);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}>
      <ScrollView
        ref={scroller}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingVertical: 12, gap: 12, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={{ gap: 16, paddingTop: 8 }}>
            {emptyTitle ? (
              <Text variant="title" accessibilityRole="header">
                {emptyTitle}
              </Text>
            ) : null}
            {emptySubtitle ? <Text tone="muted">{emptySubtitle}</Text> : null}
            {suggestions ? (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {suggestions.map((s) => (
                  <Chip key={s} label={s} onPress={() => submit(s)} />
                ))}
              </View>
            ) : null}
          </View>
        ) : null}

        {messages.map((m) => {
          const mine = m.role === 'user';
          return (
            <View key={m.id} style={{ alignItems: mine ? 'flex-end' : 'flex-start' }}>
              <View
                accessible
                accessibilityLabel={`${mine ? 'Você' : 'SELAH'}: ${m.content}`}
                style={{
                  maxWidth: '88%',
                  padding: 14,
                  borderRadius: radius.lg,
                  borderBottomRightRadius: mine ? 6 : radius.lg,
                  borderBottomLeftRadius: mine ? radius.lg : 6,
                  backgroundColor: mine ? colors.goldSoft : colors.surface,
                  borderWidth: mine ? 0 : 1,
                  borderColor: colors.border,
                }}
              >
                <Text variant="body">{m.content}</Text>
              </View>
            </View>
          );
        })}

        {sending ? (
          <View style={{ alignItems: 'flex-start' }}>
            <View style={{ padding: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Text tone="muted" accessibilityLiveRegion="polite">
                Pensando com carinho…
              </Text>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Text variant="caption" tone="muted" align="center" style={{ paddingVertical: 6 }}>
        {AI_DISCLAIMER}
      </Text>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-end',
          gap: 8,
          paddingBottom: 8,
        }}
      >
        <View
          style={{
            flex: 1,
            minHeight: MIN_TOUCH + 4,
            borderRadius: radius.md,
            borderWidth: 1.5,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            paddingHorizontal: 14,
            justifyContent: 'center',
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor={colors.textMuted}
            selectionColor={colors.gold}
            multiline
            maxLength={2000}
            accessibilityLabel="Mensagem"
            onSubmitEditing={() => submit(draft)}
            style={{ maxHeight: 120, paddingVertical: 10, fontFamily: fonts.sans, fontSize: 16 * fontScale, color: colors.text }}
          />
        </View>
        <VoiceButton onText={(text) => setDraft((d) => (d ? `${d} ${text}` : text))} />
        <Pressable
          onPress={() => submit(draft)}
          disabled={!draft.trim() || sending}
          accessibilityRole="button"
          accessibilityLabel="Enviar mensagem"
          style={{
            width: MIN_TOUCH,
            height: MIN_TOUCH,
            borderRadius: MIN_TOUCH,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: draft.trim() && !sending ? colors.gold : colors.surfaceAlt,
          }}
        >
          <Ionicons name="arrow-up" size={22} color={draft.trim() && !sending ? colors.onGold : colors.textMuted} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
