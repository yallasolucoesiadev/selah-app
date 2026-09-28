import React from 'react';
import { Image, ImageStyle, StyleProp, View } from 'react-native';

import { useTheme } from '@/hooks/useTheme';

// Logo oficial do SELAH (recorte do arquivo "logo selah" fornecido; nada foi redesenhado).
const source = require('../assets/images/logo-mark.png');
const ASPECT = 1035 / 890;
// O logo é escuro sobre creme. No modo escuro ele aparece sobre um cartão creme,
// como no arquivo original, para manter a leitura e as cores da marca.
const TILE_BACKGROUND = '#FAF6EF';

interface LogoProps {
  width?: number;
  style?: StyleProp<ImageStyle>;
}

export function Logo({ width = 220, style }: LogoProps) {
  const { isDark } = useTheme();
  const padding = isDark ? Math.round(width * 0.07) : 0;
  const innerWidth = width - padding * 2;

  const image = (
    <Image
      source={source}
      accessibilityRole="image"
      accessibilityLabel="SELAH — Seu momento diário com Deus"
      resizeMode="contain"
      style={[{ width: innerWidth, height: innerWidth / ASPECT }, style]}
    />
  );

  if (!isDark) return image;
  return (
    <View style={{ backgroundColor: TILE_BACKGROUND, borderRadius: Math.round(width * 0.14), padding, overflow: 'hidden' }}>
      {image}
    </View>
  );
}
