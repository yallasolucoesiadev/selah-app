import React from 'react';
import { View } from 'react-native';

import { FadeIn } from './FadeIn';
import { Header } from './Header';
import { Logo } from './Logo';
import { Screen } from './Screen';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  back?: boolean;
  children: React.ReactNode;
}

export function AuthLayout({ title, subtitle, back = false, children }: AuthLayoutProps) {
  return (
    <Screen>
      <Header back={back} />
      <FadeIn>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Logo width={150} />
        </View>
        <Header title={title} subtitle={subtitle} />
        <View style={{ gap: 16 }}>{children}</View>
      </FadeIn>
    </Screen>
  );
}
