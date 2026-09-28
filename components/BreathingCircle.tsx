import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { animation } from '@/constants/animations';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

/** Círculo que "respira" lentamente (inspire/expire). Estático com "reduzir movimento". */
export function BreathingCircle({ size = 200 }: { size?: number }) {
  const { colors, reduceMotion } = useTheme();
  const scale = useSharedValue(0.8);
  const [inhale, setInhale] = useState(true);

  useEffect(() => {
    if (reduceMotion) {
      scale.value = 1;
      return;
    }
    scale.value = withRepeat(
      withSequence(
        withTiming(1, { duration: animation.breathe, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.8, { duration: animation.breathe, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
    );
    const timer = setInterval(() => setInhale((v) => !v), animation.breathe);
    return () => clearInterval(timer);
  }, [reduceMotion, scale]);

  const outer = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: 0.55 + (scale.value - 0.8) * 1.2 }));
  const inner = useAnimatedStyle(() => ({ transform: [{ scale: 0.6 + (scale.value - 0.8) * 0.6 }] }));

  return (
    <View
      accessible
      accessibilityLabel="Círculo de respiração. Inspire e expire lentamente."
      style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}
    >
      <Animated.View
        style={[{ position: 'absolute', width: size, height: size, borderRadius: size, backgroundColor: colors.goldSoft }, outer]}
      />
      <Animated.View
        style={[{ position: 'absolute', width: size * 0.7, height: size * 0.7, borderRadius: size, backgroundColor: colors.gold, opacity: 0.55 }, inner]}
      />
      <Text variant="heading" tone="primary">
        {reduceMotion ? 'Respire' : inhale ? 'Inspire' : 'Expire'}
      </Text>
    </View>
  );
}
