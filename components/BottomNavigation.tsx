import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import type { Tabs } from 'expo-router';
import React from 'react';
import { Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { radius } from '@/constants/radius';
import { useTheme } from '@/hooks/useTheme';
import { Text } from './Text';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

const ITEMS: Record<string, { label: string; icon: IconName; iconActive: IconName }> = {
  index: { label: 'HOJE', icon: 'sunny-outline', iconActive: 'sunny' },
  jornada: { label: 'JORNADA', icon: 'trail-sign-outline', iconActive: 'trail-sign' },
  conversar: { label: 'CONVERSAR', icon: 'chatbubble-ellipses-outline', iconActive: 'chatbubble-ellipses' },
  espaco: { label: 'MEU ESPAÇO', icon: 'person-outline', iconActive: 'person' },
};

/** Barra de navegação inferior: HOJE · JORNADA · CONVERSAR · MEU ESPAÇO. */
export function BottomNavigation({ state, navigation }: BottomTabBarProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      accessibilityRole="tablist"
      style={{
        flexDirection: 'row',
        backgroundColor: colors.tabBar,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        borderTopLeftRadius: radius.lg,
        borderTopRightRadius: radius.lg,
        overflow: 'hidden',
        paddingTop: 8,
        paddingBottom: Math.max(insets.bottom, 8),
      }}
    >
      {state.routes.map((route, index) => {
        const item = ITEMS[route.name];
        if (!item) return null;
        const focused = state.index === index;
        const color = focused ? colors.caramel : colors.textMuted;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync().catch(() => undefined);
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityLabel={item.label}
            accessibilityState={{ selected: focused }}
            style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center', gap: 3 }}
          >
            <Ionicons name={focused ? item.iconActive : item.icon} size={24} color={color} />
            <Text variant="caption" style={{ color, fontSize: 10.5, letterSpacing: 0.6 }} numberOfLines={1}>
              {item.label}
            </Text>
            <View
              style={{
                width: focused ? 18 : 0,
                height: 3,
                borderRadius: 3,
                backgroundColor: colors.gold,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
