import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { View } from 'react-native';

import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Header } from '@/components/Header';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { useLoad } from '@/hooks/useLoad';
import { useTheme } from '@/hooks/useTheme';
import { Entitlements, getEntitlements, PREMIUM_FEATURES } from '@/services/subscription';

export default function SubscriptionScreen() {
  const { colors } = useTheme();
  const { data: entitlements } = useLoad<Entitlements>(getEntitlements, { plan: 'free', features: new Set() });

  return (
    <Screen>
      <Header back title="Assinatura" subtitle="Seu plano atual" />
      <Card style={{ gap: 4, marginBottom: 24 }}>
        <Text variant="overline" tone="accent">
          Plano
        </Text>
        <Text variant="title">{entitlements.plan === 'premium' ? 'Premium' : 'Gratuito'}</Text>
        <Text variant="caption" tone="muted">
          Por enquanto, todos os recursos estão liberados.
        </Text>
      </Card>

      <Text variant="heading" style={{ marginBottom: 12 }}>
        SELAH Premium (em breve)
      </Text>
      <View style={{ gap: 14, marginBottom: 24 }}>
        {PREMIUM_FEATURES.map((f) => (
          <View key={f.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
            <Ionicons name="sparkles-outline" size={22} color={colors.caramel} style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text variant="label">{f.label}</Text>
              <Text variant="caption" tone="muted">
                {f.description}
              </Text>
            </View>
          </View>
        ))}
      </View>
      <Button title="Em breve" onPress={() => undefined} disabled />
    </Screen>
  );
}
