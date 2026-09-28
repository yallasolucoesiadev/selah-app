import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { MenuRow } from '@/components/MenuRow';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { useStats } from '@/hooks/useStats';

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <Card tone="soft" style={{ flexBasis: '47%', flexGrow: 1, gap: 2, padding: 16 }}>
      <Text variant="title">{value}</Text>
      <Text variant="caption" tone="muted">
        {label}
      </Text>
    </Card>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { profile, updateProfile, signOut, isDemo } = useAuth();
  const stats = useStats();
  const [draftName, setName] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const name = draftName ?? profile?.name ?? '';

  const save = async () => {
    await updateProfile({ name: name.trim() || null });
    setName(null);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Screen>
      <Header back title="Perfil" subtitle={isDemo ? 'Modo demonstração' : undefined} />
      <View style={{ gap: 12, marginBottom: 20 }}>
        <TextField label="Seu nome" value={name} onChangeText={setName} placeholder="Como quer ser chamado?" />
        <Button
          title={saved ? 'Salvo ✓' : 'Salvar nome'}
          variant="secondary"
          onPress={() => void save()}
          disabled={name.trim() === (profile?.name ?? '')}
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
        <Stat value={stats.journeyDays} label="Dias de jornada" />
        <Stat value={stats.completed} label="Momentos concluídos" />
        <Stat value={stats.prayers} label="Orações salvas" />
        <Stat value={stats.reflections} label="Reflexões salvas" />
      </View>

      <View style={{ paddingBottom: 16 }}>
        <MenuRow icon="settings-outline" label="Configurações" onPress={() => router.push('/configuracoes')} />
        <MenuRow icon="notifications-outline" label="Notificações" onPress={() => router.push('/lembretes')} />
        <MenuRow icon="shield-checkmark-outline" label="Privacidade" onPress={() => router.push('/privacidade')} />
        <MenuRow icon="document-text-outline" label="Termos" onPress={() => router.push('/termos')} />
        <MenuRow icon="sparkles-outline" label="Assinatura" onPress={() => router.push('/assinatura')} />
        <MenuRow icon="information-circle-outline" label="Sobre" onPress={() => router.push('/sobre')} />
      </View>
      <View style={{ paddingBottom: 24 }}>
        <Button title="Sair da conta" variant="secondary" onPress={() => void signOut()} />
      </View>
    </Screen>
  );
}
