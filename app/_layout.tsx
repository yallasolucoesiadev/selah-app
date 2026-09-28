import {
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold } from '@expo-google-fonts/manrope';
import { useFonts } from 'expo-font';
import { Stack, useRootNavigationState, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { PrefsProvider, usePrefs } from '@/hooks/usePrefs';
import { useReminderSync } from '@/hooks/useReminderSync';
import { useTheme } from '@/hooks/useTheme';
import { configureNotifications } from '@/services/notificationService';

SplashScreen.preventAutoHideAsync().catch(() => undefined);
configureNotifications();

function RecoveryRedirect() {
  const { recovering, signedIn } = useAuth();
  const router = useRouter();
  const navReady = Boolean(useRootNavigationState()?.key);

  useEffect(() => {
    if (navReady && recovering && signedIn) router.replace('/nova-senha');
  }, [navReady, recovering, signedIn, router]);
  return null;
}

function Gate() {
  const { colors, isDark } = useTheme();
  const { signedIn, loading: authLoading } = useAuth();
  const { prefs, ready: prefsReady } = usePrefs();
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_400Regular,
    Fraunces_400Regular_Italic,
    Fraunces_600SemiBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
  });
  useReminderSync();

  const ready = (fontsLoaded || Boolean(fontError)) && prefsReady && !authLoading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => undefined);
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false, animation: 'fade', contentStyle: { backgroundColor: colors.background } }}>
        <Stack.Protected guard={!signedIn && !prefs.onboardingSeen}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>

        <Stack.Protected guard={!signedIn}>
          <Stack.Screen name="login" />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot" />
        </Stack.Protected>

        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="devocional/[day]" options={{ animation: 'slide_from_bottom' }} />
          <Stack.Screen name="desafio" />
          <Stack.Screen name="favoritos" />
          <Stack.Screen name="reflexoes" />
          <Stack.Screen name="oracoes" />
          <Stack.Screen name="historico" />
          <Stack.Screen name="lembretes" />
          <Stack.Screen name="configuracoes" />
          <Stack.Screen name="perfil" />
          <Stack.Screen name="assinatura" />
          <Stack.Screen name="sobre" />
          <Stack.Screen name="privacidade" />
          <Stack.Screen name="termos" />
          <Stack.Screen name="nova-senha" />
        </Stack.Protected>
      </Stack>
      <RecoveryRedirect />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PrefsProvider>
          <AuthProvider>
            <Gate />
          </AuthProvider>
        </PrefsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
