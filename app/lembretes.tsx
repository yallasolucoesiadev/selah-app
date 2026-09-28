import React, { useState } from 'react';
import { Platform, Switch, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { usePrefs } from '@/hooks/usePrefs';
import { useTheme } from '@/hooks/useTheme';
import { normalizeTime, REMINDER_PRESETS } from '@/lib/time';
import { REMINDER_BODY, requestNotificationPermission } from '@/services/notificationService';

export default function RemindersScreen() {
  const { colors } = useTheme();
  const { profile, updateProfile } = useAuth();
  const { prefs, setPref } = usePrefs();
  const [customOpen, setCustomOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const [customError, setCustomError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const time = profile?.reminder_time ?? '08:00';
  const isCustom = !REMINDER_PRESETS.includes(time as (typeof REMINDER_PRESETS)[number]);

  const toggle = async (enabled: boolean) => {
    setNotice(null);
    if (enabled && Platform.OS !== 'web') {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotice('Permita as notificações nas configurações do celular para receber o lembrete.');
        return;
      }
    }
    setPref('notificationsEnabled', enabled);
  };

  const chooseTime = (value: string) => {
    updateProfile({ reminder_time: value }).catch(() => setNotice('Não foi possível salvar o horário.'));
  };

  const confirmCustom = () => {
    const normalized = normalizeTime(customValue);
    if (!normalized) return setCustomError('Use o formato HH:MM, por exemplo 06:30.');
    chooseTime(normalized);
    setCustomOpen(false);
    setCustomError(null);
  };

  return (
    <Screen>
      <Header back title="Lembretes" subtitle="Um convite gentil para o seu momento." />
      <Card style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text variant="heading">Lembrete diário</Text>
            <Text variant="caption" tone="muted">
              {REMINDER_BODY}
            </Text>
          </View>
          <Switch
            value={prefs.notificationsEnabled}
            onValueChange={(v) => void toggle(v)}
            trackColor={{ true: colors.gold, false: colors.border }}
            thumbColor={colors.surface}
            accessibilityLabel="Ativar lembrete diário"
          />
        </View>
        {notice ? (
          <Text variant="caption" tone="danger" accessibilityLiveRegion="polite">
            {notice}
          </Text>
        ) : null}
        {Platform.OS === 'web' ? (
          <Text variant="caption" tone="muted">
            Notificações agendadas funcionam no aplicativo instalado no celular.
          </Text>
        ) : null}
      </Card>

      <View style={{ marginTop: 24, gap: 12 }}>
        <Text variant="heading">Horário</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {REMINDER_PRESETS.map((preset) => (
            <Chip key={preset} label={preset} selected={time === preset} onPress={() => chooseTime(preset)} />
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
