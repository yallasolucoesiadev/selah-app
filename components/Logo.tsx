import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

// Logo oficial do SELAH (recorte do arquivo "logo selah" fornecido; nada foi redesenhado).
const source = require('../assets/images/logo-mark.png');
const ASPECT = 1035 / 890;

interface LogoProps {
  width?: number;
  style?: StyleProp<ImageStyle>;
}

export function Logo({ width = 220, style }: LogoProps) {
  return (
    <Image
      source={source}
      accessibilityRole="image"
      accessibilityLabel="SELAH — Seu momento diário com Deus"
      resizeMode="contain"
      style={[{ width, height: width / ASPECT }, style]}
    />
  );
}
