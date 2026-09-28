import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { animation } from '@/constants/animations';
import { useTheme } from '@/hooks/useTheme';

function Wisp({ delay, left, height, reduce }: { delay: number; left: number; height: number; reduce: boolean }) {
  const { colors } = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (reduce) return;
    progress.value = withDelay(
      delay,
      withRepeat(withTiming(1, { duration: animation.steam, easing: Easing.inOut(Easing.quad) }), -1, false),
    );
  }, [delay, progress, reduce]);

  const style = useAnimatedStyle(() => ({
    opacity: reduce ? 0.35 : progress.value < 0.5 ? progress.value * 0.9 : (1 - progress.value) * 0.9,
    transform: [
      { translateY: reduce ? 0 : -progress.value * 18 },
      { translateX: reduce ? 0 : Math.sin(progress.value * Math.PI * 2) * 3 },
      { scaleY: reduce ? 1 : 0.8 + progress.value * 0.4 },
    ],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom: 0,
          left,
          width: 3,
          height,
          borderRadius: 3,
          backgroundColor: colors.caramel,
        },
        style,
      ]}
    />
  );
}

/** Xícara com vapor sutil (marca do "café com Deus", sem exagero). */
export function CupSteam({ size = 56 }: { size?: number }) {
  const { colors, reduceMotion } = useTheme();
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={{ alignItems: 'center', justifyContent: 'flex-end', width: size, height: size + 26 }}
    >
      <View style={{ position: 'absolute', top: 0, width: size, height: 26 }}>
        <Wisp delay={0} left={size * 0.32} height={14} reduce={reduceMotion} />
        <Wisp delay={900} left={size * 0.5} height={18} reduce={reduceMotion} />
        <Wisp delay={1800} left={size * 0.66} height={12} reduce={reduceMotion} />
      </View>
      <Ionicons name="cafe-outline" size={size} color={colors.caramel} />
    </View>
  );
}
