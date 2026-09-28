import { useRouter } from 'expo-router';
import React, { useState } from 'react';

import { AuthLayout } from '@/components/AuthLayout';
import { Button } from '@/components/Button';
import { TextField } from '@/components/TextField';
import { useAuth } from '@/hooks/useAuth';
import { isValidPassword, MIN_PASSWORD_LENGTH } from '@/lib/validation';

export default function NewPasswordScreen() {
  const router = useRouter();
  const { updatePassword, clearRecovery } = useAuth();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!isValidPassword(password)) return setError(`A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`);
    if (password !== confirm) return setError('As senhas não conferem.');
    setError(null);
    setLoading(true);
    const result = await updatePassword(password);
    setLoading(false);
    if (!result.ok) return setError(result.message ?? 'Não foi possível atualizar a senha.');
    router.replace('/');
  };

  return (
    <AuthLayout title="Nova senha" subtitle="Escolha uma senha que só você conheça.">
      <TextField label="Nova senha" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
      <TextField label="Repita a senha" value={confirm} onChangeText={setConfirm} secureTextEntry error={error} onSubmitEditing={submit} />
      <Button title="Salvar nova senha" onPress={submit} loading={loading} />
      <Button
        title="Agora não"
        variant="ghost"
        onPress={() => {
          clearRecovery();
          router.replace('/');
        }}
      />
    </AuthLayout>
  );
}
