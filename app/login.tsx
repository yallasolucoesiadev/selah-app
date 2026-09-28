import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/lib/validation';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, enterDemo, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!isValidEmail(email)) return setError('Digite um e-mail válido.');
    if (!password) return setError('Digite sua senha.');
    setError(null);
    setLoading(true);
    const result = await signIn(email, password);
    setLoading(false);
    if (!result.ok) setError(result.message ?? 'Não foi possível entrar.');
    // Sucesso: a sessão muda e o guarda de rotas leva ao app.
  };

  return (
    <AuthLayout title="Que bom te ver de volta." subtitle="Entre para continuar sua jornada.">
      {!configured ? (
        <Card tone="soft" style={{ gap: 8 }}>
          <Text variant="label">Modo demonstração</Text>
          <Text variant="caption" tone="muted">
            O Supabase ainda não foi configurado (.env vazio). Você pode explorar o app com dados locais de exemplo.
          </Text>
          <Button title="Explorar em modo demonstração" variant="secondary" onPress={() => void enterDemo()} />
        </Card>
      ) : null}

      <TextField
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        textContentType="emailAddress"
        placeholder="voce@email.com"
      />
      <TextField
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        placeholder="Sua senha"
        error={error}
        onSubmitEditing={submit}
      />
      <Button title="Entrar" onPress={submit} loading={loading} disabled={!configured} />
      <View style={{ gap: 4 }}>
        <Button title="Esqueci minha senha" variant="ghost" onPress={() => router.push('/forgot')} />
        <Button title="Criar conta" variant="ghost" onPress={() => router.push('/signup')} />
      </View>
    </AuthLayout>
  );
}
