export const fonts = {
  serif: 'Fraunces_400Regular',
  serifItalic: 'Fraunces_400Regular_Italic',
  serifBold: 'Fraunces_600SemiBold',
  sans: 'Manrope_400Regular',
  sansMedium: 'Manrope_500Medium',
  sansBold: 'Manrope_600SemiBold',
} as const;

export type TextVariant =
  | 'display'
  | 'title'
  | 'heading'
  | 'verse'
  | 'bodyLarge'
  | 'body'
  | 'label'
  | 'caption'
  | 'overline';

type VariantStyle = {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing?: number;
  textTransform?: 'uppercase';
};

export const typography: Record<TextVariant, VariantStyle> = {
  display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 42, letterSpacing: -0.4 },
  title: { fontFamily: fonts.serifBold, fontSize: 26, lineHeight: 34, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.serifBold, fontSize: 20, lineHeight: 28 },
  verse: { fontFamily: fonts.serifItalic, fontSize: 20, lineHeight: 31 },
  bodyLarge: { fontFamily: fonts.sans, fontSize: 18, lineHeight: 30 },
  body: { fontFamily: fonts.sans, fontSize: 16, lineHeight: 25 },
  label: { fontFamily: fonts.sansBold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.sansMedium, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
};

/** Passos do seletor de tamanho de fonte (acessibilidade). */
export const FONT_SCALES = [0.9, 1, 1.1, 1.25, 1.4] as const;
