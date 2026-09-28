import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { isValidEmail } from '@/lib/validation';

export default function ForgotScreen() {
  const router = useRouter();
  const { resetPassword, configured } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!isValidEmail(email)) return setError('Digite um e-mail válido.');
    setError(null);
    setLoading(true);
    const result = await resetPassword(email);
    setLoading(false);
    if (!result.ok) return setError(result.message ?? 'Não foi possível enviar o e-mail.');
    setSent(true);
  };

  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link para você criar uma nova senha." back>
      {sent ? (
        <>
          <Card tone="soft" style={{ gap: 8 }}>
            <Text>Se este e-mail tiver uma conta, o link já está a caminho. Abra o e-mail neste celular para continuar.</Text>
            <Text variant="caption" tone="muted">
              Dica: Verifique sua pasta de spam se não encontrar o e-mail em alguns minutos.
            </Text>
          </Card>
          <Button title="Voltar ao login" onPress={() => router.replace('/login')} />
        </>
      ) : (
        <>
          <TextField
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            placeholder="voce@email.com"
            error={error}
            onSubmitEditing={submit}
          />
          <Button title="Enviar link" onPress={submit} loading={loading} disabled={!configured} />
        </>
      )}
    </AuthLayout>
  );
}
