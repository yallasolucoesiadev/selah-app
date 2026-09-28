import { Tabs } from 'expo-router';
import React from 'react';

import { BottomNavigation } from '@/components/BottomNavigation';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BottomNavigation {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="jornada" options={{ title: 'Jornada' }} />
      <Tabs.Screen name="conversar" options={{ title: 'Conversar' }} />
      <Tabs.Screen name="espaco" options={{ title: 'Meu espaço' }} />
    </Tabs>
  );
}
