import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Switch, View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Chip } from '@/components/Chip';
import { Header } from '@/components/Header';
import { MenuRow } from '@/components/MenuRow';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { FONT_SCALES } from '@/constants/typography';
import { useAuth } from '@/hooks/useAuth';
import { ThemeMode, usePrefs } from '@/hooks/usePrefs';
import { useTheme } from '@/hooks/useTheme';
import { getMemoryEnabled, setMemoryEnabled } from '@/services/data';

const MODES: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'Automático' },
  { id: 'light', label: 'Claro' },
  { id: 'dark', label: 'Escuro' },
];

export default function SettingsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { signOut } = useAuth();
  const { prefs, setPref } = usePrefs();
  const [memory, setMemory] = useState(false);
  const [memoryError, setMemoryError] = useState<string | null>(null);

  useEffect(() => {
    getMemoryEnabled()
      .then(setMemory)
      .catch(() => undefined);
  }, []);

  const changeMemory = async (enabled: boolean) => {
    setMemory(enabled);
    setMemoryError(null);
    try {
      await setMemoryEnabled(enabled);
    } catch {
      setMemory(!enabled);
      setMemoryError('Não foi possível salvar essa preferência agora.');
    }
  };

  return (
    <Screen>
      <Header back title="Configurações" />

      <View style={{ gap: 24, paddingBottom: 24 }}>
        <View style={{ gap: 12 }}>
          <Text variant="heading">Aparência</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {MODES.map((m) => (
              <Chip key={m.id} label={m.label} selected={prefs.mode === m.id} onPress={() => setPref('mode', m.id)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text variant="heading">Tamanho da letra</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {FONT_SCALES.map((scale) => (
              <Chip key={scale} label={`${Math.round(scale * 100)}%`} selected={prefs.fontScale === scale} onPress={() => setPref('fontScale', scale)} />
            ))}
          </View>
          <Text variant="caption" tone="muted">
            As animações seguem a opção “reduzir movimento” do seu celular.
          </Text>
        </View>

        <Card style={{ gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="heading">Memória da IA</Text>
              <Text>Permitir que a SELAH use minhas reflexões anteriores para personalizar minhas conversas.</Text>
            </View>
            <Switch
              value={memory}
              onValueChange={(v) => void changeMemory(v)}
              trackColor={{ true: colors.gold, false: colors.border }}
              thumbColor={colors.surface}
              accessibilityLabel="Permitir que a SELAH use minhas reflexões anteriores para personalizar minhas conversas"
            />
          </View>
          <Text variant="caption" tone="muted">
            Desligado por padrão. Você pode mudar quando quiser.
          </Text>
          {memoryError ? <Text variant="caption" tone="danger">{memoryError}</Text> : null}
        </Card>

        <View>
          <MenuRow icon="notifications-outline" label="Notificações" onPress={() => router.push('/lembretes')} />
          <MenuRow icon="shield-checkmark-outline" label="Privacidade" onPress={() => router.push('/privacidade')} />
          <MenuRow icon="document-text-outline" label="Termos de uso" onPress={() => router.push('/termos')} />
        </View>

        <Button title="Sair da conta" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}
