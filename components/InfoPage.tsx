import React from 'react';
import { View } from 'react-native';

import { Header } from './Header';
import { Screen } from './Screen';
import { Text } from './Text';

export interface InfoSection {
  heading: string;
  body: string;
}

export function InfoPage({ title, intro, sections }: { title: string; intro?: string; sections: InfoSection[] }) {
  return (
    <Screen>
      <Header back title={title} />
      {intro ? (
        <Text variant="bodyLarge" tone="muted" style={{ marginBottom: 20 }}>
          {intro}
        </Text>
      ) : null}
      <View style={{ gap: 20, paddingBottom: 24 }}>
        {sections.map((s) => (
          <View key={s.heading} style={{ gap: 6 }}>
            <Text variant="heading">{s.heading}</Text>
            <Text>{s.body}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}
