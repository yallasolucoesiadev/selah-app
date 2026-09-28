/**
 * Tokens de cor do SELAH.
 * Paleta derivada do logo oficial: creme, marrom café, caramelo e dourado suave.
 */
export type Palette = {
  background: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textInverse: string;
  caramel: string;
  gold: string;
  goldSoft: string;
  onGold: string;
  success: string;
  danger: string;
  overlay: string;
  tabBar: string;
};

export const lightColors: Palette = {
  background: '#FAF6EF',
  surface: '#FFFCF7',
  surfaceAlt: '#F3EBDD',
  border: '#E8DDCB',
  text: '#3B2A1E',
  textMuted: '#7A6A5C',
  textInverse: '#FFFCF7',
  caramel: '#A9713D',
  gold: '#C8A96A',
  goldSoft: '#EFE2C4',
  onGold: '#3B2A1E',
  success: '#6F8F5E',
  danger: '#B5533C',
  overlay: 'rgba(59, 42, 30, 0.35)',
  tabBar: 'rgba(255, 252, 247, 0.96)',
};

export const darkColors: Palette = {
  background: '#1B1511',
  surface: '#261E18',
  surfaceAlt: '#31271F',
  border: '#3F332A',
  text: '#F2E8DA',
  textMuted: '#B5A592',
  textInverse: '#1B1511',
  caramel: '#D39A62',
  gold: '#D9BC80',
  goldSoft: '#4A3D28',
  onGold: '#1B1511',
  success: '#8FB07C',
  danger: '#D9826B',
  overlay: 'rgba(0, 0, 0, 0.55)',
  tabBar: 'rgba(38, 30, 24, 0.96)',
};
