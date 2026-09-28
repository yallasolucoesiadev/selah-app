import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail, isValidPassword, MIN_PASSWORD_LENGTH } from '@/lib/validation';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp, enterDemo, configured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async () => {
    if (!name.trim()) return setError('Como podemos te chamar?');
    if (!isValidEmail(email)) return setError('Digite um e-mail válido.');
    if (!isValidPassword(password)) return setError(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    setError(null);
    setLoading(true);
    const result = await signUp(name, email, password);
    setLoading(false);
    if (!result.ok) return setError(result.message ?? 'Não foi possível criar a conta.');
    if (result.needsConfirmation) setConfirmSent(true);
  };

  if (confirmSent) {
    return (
      <AuthLayout title="Confirme seu e-mail" back>
        <Card tone="soft" style={{ gap: 8 }}>
          <Text>
            Enviamos um link de confirmação para {email.trim()}. Abra o e-mail, confirme e depois volte para entrar.
          </Text>
        </Card>
        <Button title="Ir para o login" onPress={() => router.replace('/login')} />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Criar sua conta" subtitle="Seu espaço pessoal, só seu." back>
      {!configured ? (
        <Card tone="soft" style={{ gap: 8 }}>
          <Text variant="caption" tone="muted">
            Supabase não configurado. Para explorar agora, use o modo demonstração.
          </Text>
          <Button title="Explorar em modo demonstração" variant="secondary" onPress={() => void enterDemo(name)} />
        </Card>
      ) : null}
      <TextField label="Seu nome" value={name} onChangeText={setName} autoComplete="name" textContentType="givenName" placeholder="Como quer ser chamado?" />
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
        autoComplete="new-password"
        textContentType="newPassword"
        placeholder={`Mínimo de ${MIN_PASSWORD_LENGTH} caracteres`}
        error={error}
        onSubmitEditing={submit}
      />
      <Button title="Criar conta" onPress={submit} loading={loading} disabled={!configured} />
      <Button title="Já tenho conta" variant="ghost" onPress={() => router.replace('/login')} />
    </AuthLayout>
  );
}
