import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AudioPlayer as AudioPlayerInstance, setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import React, { useEffect, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, View } from 'react-native';

import { MIN_TOUCH } from '@/constants/spacing';
import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

interface AudioPlayerProps {
  uri: string;
  title: string;
  /** Chave para lembrar onde o usuário parou. */
  resumeKey?: string;
}

const RATES = [1, 1.25, 1.5, 0.75];

// O volume do expo-audio é uma propriedade do objeto nativo do player.
function applyVolume(player: AudioPlayerInstance, value: number) {
  player.volume = value;
}

function format(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds || 0));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

function IconButton({
  name,
  label,
  onPress,
  size = 26,
  filled = false,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  size?: number;
  filled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={{
        width: filled ? 64 : MIN_TOUCH,
        height: filled ? 64 : MIN_TOUCH,
        borderRadius: 64,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: filled ? colors.gold : 'transparent',
      }}
    >
      <Ionicons name={name} size={size} color={filled ? colors.onGold : colors.text} />
    </Pressable>
  );
}

export function AudioPlayer({ uri, title, resumeKey }: AudioPlayerProps) {
  const { colors } = useTheme();
  const player = useAudioPlayer(uri);
  const status = useAudioPlayerStatus(player);
  const [rateIndex, setRateIndex] = useState(0);
  const [volume, setVolume] = useState(1);
  const [barWidth, setBarWidth] = useState(0);
  const restored = useRef(false);

  // Reprodução em segundo plano + tocar mesmo no modo silencioso.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true, interruptionMode: 'doNotMix' }).catch(
      () => undefined,
    );
  }, []);

  // Retoma de onde parou.
  useEffect(() => {
    if (!resumeKey || !status.isLoaded || restored.current) return;
    restored.current = true;
    AsyncStorage.getItem(`selah.audio.${resumeKey}`)
      .then((value) => {
        const position = Number(value);
        if (position > 3 && position < status.duration - 3) void player.seekTo(position);
      })
      .catch(() => undefined);
  }, [resumeKey, status.isLoaded, status.duration, player]);

  // Guarda a posição ao pausar/sair.
  useEffect(() => {
    if (!resumeKey || status.playing) return;
    if (status.currentTime > 0) {
      AsyncStorage.setItem(`selah.audio.${resumeKey}`, String(status.currentTime)).catch(() => undefined);
    }
  }, [resumeKey, status.playing, status.currentTime]);

  useEffect(() => {
    if (!status.playing) return;
    try {
      player.setActiveForLockScreen(true, { title, artist: 'SELAH' });
    } catch {
      // Controles da tela de bloqueio indisponíveis neste ambiente (ex.: Expo Go/web).
    }
  }, [status.playing, player, title]);

  const toggle = () => (status.playing ? player.pause() : player.play());
  const skip = (delta: number) => {
    const target = Math.min(Math.max(0, status.currentTime + delta), status.duration || Infinity);
    void player.seekTo(target);
  };
  const cycleRate = () => {
    const next = (rateIndex + 1) % RATES.length;
    setRateIndex(next);
    player.setPlaybackRate(RATES[next]);
  };
  const changeVolume = (delta: number) => {
    const next = Math.round(Math.min(1, Math.max(0, volume + delta)) * 10) / 10;
    setVolume(next);
    applyVolume(player, next);
  };
  const seekFromTouch = (x: number) => {
    if (!barWidth || !status.duration) return;
    void player.seekTo((Math.max(0, Math.min(x, barWidth)) / barWidth) * status.duration);
  };

  const ratio = status.duration ? Math.min(1, status.currentTime / status.duration) : 0;

  return (
    <View
      style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.lg, padding: 16, gap: 8 }}
      accessibilityLabel={`Player de áudio: ${title}`}
    >
      <Pressable
        accessibilityRole="adjustable"
        accessibilityLabel="Posição do áudio"
        accessibilityValue={{ text: `${format(status.currentTime)} de ${format(status.duration)}` }}
        onLayout={(e: LayoutChangeEvent) => setBarWidth(e.nativeEvent.layout.width)}
        onPress={(e) => seekFromTouch(e.nativeEvent.locationX)}
        style={{ height: 24, justifyContent: 'center' }}
      >
        <View style={{ height: 6, borderRadius: 6, backgroundColor: colors.border, overflow: 'hidden' }}>
          <View style={{ width: `${ratio * 100}%`, height: 6, backgroundColor: colors.gold }} />
        </View>
      </Pressable>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="caption" tone="muted">
          {format(status.currentTime)}
        </Text>
        <Text variant="caption" tone="muted">
          {format(status.duration)}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <IconButton name="play-back" label="Retroceder 15 segundos" onPress={() => skip(-15)} />
        <IconButton
          name={status.playing ? 'pause' : 'play'}
          label={status.playing ? 'Pausar' : 'Reproduzir'}
          onPress={toggle}
          filled
          size={28}
        />
        <IconButton name="play-forward" label="Avançar 15 segundos" onPress={() => skip(15)} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Pressable
          onPress={cycleRate}
          accessibilityRole="button"
          accessibilityLabel={`Velocidade ${RATES[rateIndex]}x. Toque para alterar`}
          style={{ minHeight: MIN_TOUCH, justifyContent: 'center', paddingHorizontal: 8 }}
        >
          <Text variant="label" tone="accent">
            {RATES[rateIndex]}x
          </Text>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconButton name="volume-low" label="Diminuir volume" onPress={() => changeVolume(-0.2)} size={20} />
          <Text variant="caption" tone="muted" accessibilityLabel={`Volume ${Math.round(volume * 100)} por cento`}>
            {Math.round(volume * 100)}%
          </Text>
          <IconButton name="volume-high" label="Aumentar volume" onPress={() => changeVolume(0.2)} size={20} />
        </View>
      </View>
    </View>
  );
}
