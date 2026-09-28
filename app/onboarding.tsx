import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';

import { BreathingCircle } from '@/components/BreathingCircle';
import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { FadeIn } from '@/components/FadeIn';
import { Logo } from '@/components/Logo';
import { Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useTheme } from '@/hooks/useTheme';
import { usePrefs } from '@/hooks/usePrefs';
import { normalizeTime, REMINDER_PRESETS } from '@/lib/time';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

const PAGES: { title: string; body: string; icon?: IconName }[] = [
  { title: 'SELAH', body: 'Seu momento diário com Deus.' },
  { title: 'Uma pausa para você.', body: 'Alguns minutos por dia para respirar, ler a Palavra e estar presente.', icon: 'leaf-outline' },
  {
    title: 'Reflexão guiada por IA.',
    body: 'Uma companheira de reflexão que ouve e faz perguntas. Ela não substitui pastor, psicólogo ou médico.',
    icon: 'chatbubbles-outline',
  },
  { title: 'Uma jornada de 365 dias.', body: 'Um passo por dia, no seu ritmo, sem cobranças.', icon: 'trail-sign-outline' },
  { title: 'Seu espaço pessoal.', body: 'Reflexões, orações e favoritos guardados só para você.', icon: 'lock-closed-outline' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { setPref } = usePrefs();
  const [index, setIndex] = useState(0);
  const [time, setTime] = useState<string>('08:00');
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);

  const isLast = index === PAGES.length;
  const isCustom = !REMINDER_PRESETS.includes(time as (typeof REMINDER_PRESETS)[number]);

  const finish = (target: '/signup' | '/login') => {
    setPref('pendingReminderTime', time);
    router.replace(target);
    setPref('onboardingSeen', true);
  };

  const confirmCustom = () => {
    const normalized = normalizeTime(customValue);
    if (!normalized) return setCustomError('Use o formato HH:MM, por exemplo 06:30.');
    setTime(normalized);
    setCustomOpen(false);
    setCustomError(null);
  };

  return (
    <Screen
      footer={
        isLast ? (
          <View style={{ gap: 8 }}>
            <Button title="Criar conta" onPress={() => finish('/signup')} />
            <Button title="Entrar" variant="secondary" onPress={() => finish('/login')} />
          </View>
        ) : (
          <Button title="Continuar" onPress={() => setIndex((i) => i + 1)} />
        )
      }
    >
      <View style={{ minHeight: 48, alignItems: 'flex-end', justifyContent: 'center' }}>
        {!isLast ? (
          <Pressable
            onPress={() => setIndex(PAGES.length)}
            accessibilityRole="button"
            accessibilityLabel="Pular apresentação"
            hitSlop={12}
          >
            <Text variant="label" tone="muted">
              Pular
            </Text>
          </Pressable>
        ) : null}
      </View>

      <FadeIn key={index} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 20, paddingVertical: 16 }}>
        {index === 0 ? (
          <>
            <Logo width={280} />
            <Text variant="bodyLarge" tone="muted" align="center">
              {PAGES[0].body}
            </Text>
          </>
        ) : !isLast ? (
          <>
            {index === 1 ? (
              <BreathingCircle size={170} />
            ) : (
              <View
                style={{ width: 120, height: 120, borderRadius: 120, backgroundColor: colors.goldSoft, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={PAGES[index].icon ?? 'leaf-outline'} size={48} color={colors.caramel} />
              </View>
            )}
            <Text variant="display" align="center" accessibilityRole="header">
              {PAGES[index].title}
            </Text>
            <Text variant="bodyLarge" tone="muted" align="center">
              {PAGES[index].body}
            </Text>
          </>
        ) : (
          <View style={{ gap: 20, alignSelf: 'stretch' }}>
            <Text variant="display" align="center" accessibilityRole="header">
              Quando você gostaria de fazer seu momento?
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
              {REMINDER_PRESETS.map((preset) => (
                <Chip key={preset} label={preset} selected={time === preset} onPress={() => setTime(preset)} />
              ))}
              <Chip
                label={isCustom ? time : 'Personalizado'}
                selected={isCustom}
                onPress={() => {
                  setCustomValue(isCustom ? time : '');
                  setCustomOpen(true);
                }}
              />
            </View>
            <Text variant="caption" tone="muted" align="center">
              Você pode mudar isso depois em Meu espaço.
            </Text>
          </View>
        )}
      </FadeIn>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, paddingBottom: 8 }} accessibilityLabel={`Página ${index + 1} de ${PAGES.length + 1}`}>
        {Array.from({ length: PAGES.length + 1 }).map((_, i) => (
          <View
            key={i}
            style={{ width: i === index ? 22 : 8, height: 8, borderRadius: 8, backgroundColor: i === index ? colors.gold : colors.border }}
          />
        ))}
      </View>

      <Sheet visible={customOpen} onClose={() => setCustomOpen(false)} title="Horário personalizado">
        <View style={{ gap: 16 }}>
          <TextField
            label="Horário (HH:MM)"
            value={customValue}
            onChangeText={setCustomValue}
            keyboardType="numbers-and-punctuation"
            placeholder="06:30"
            maxLength={5}
            error={customError}
            onSubmitEditing={confirmCustom}
          />
          <Button title="Definir horário" onPress={confirmCustom} />
        </View>
      </Sheet>
    </Screen>
  );
}
