import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useRouter, usePathname } from 'expo-router';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAppTheme } from '@/store/theme-store';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

const NAV_ITEMS = [
  { name: 'Home', path: '/', icon: 'house.fill' as const },
];

export function WebSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const colorScheme = useColorScheme();
  const { themeMode, setThemeMode } = useAppTheme();

  const isDark = colorScheme === 'dark';
  const tintColor = Colors[colorScheme ?? 'light'].tint;

  const toggleTheme = () => {
    setThemeMode(themeMode === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemedView style={[styles.container, { borderRightColor: isDark ? '#2A2D3E' : '#E4E6EF' }]}>
      <View style={styles.topSection}>
        <View style={styles.logoContainer}>
          <IconSymbol size={28} name="paperplane.fill" color={tintColor} />
          <ThemedText style={styles.logoText}>MyApp</ThemedText>
        </View>

        <View style={styles.navContainer}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Pressable
                key={item.path}
                onPress={() => router.push(item.path as any)}
                style={({ pressed }) => [
                  styles.navItem,
                  isActive && { backgroundColor: isDark ? '#1E2030' : '#F5F6FA' },
                  pressed && { opacity: 0.7 }
                ]}
              >
                <IconSymbol 
                  size={24} 
                  name={item.icon} 
                  color={isActive ? tintColor : (isDark ? '#8B8FA3' : '#6B7280')} 
                />
                <ThemedText style={[
                  styles.navText,
                  { color: isActive ? tintColor : (isDark ? '#8B8FA3' : '#6B7280'), fontWeight: isActive ? '700' : '500' }
                ]}>
                  {item.name}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.bottomSection}>
        <Pressable onPress={toggleTheme} style={({ pressed }) => [styles.navItem, pressed && { opacity: 0.7 }]}>
          <IconSymbol 
            size={24} 
            name={themeMode === 'dark' ? 'sun.max.fill' : 'moon.fill'} 
            color={isDark ? '#8B8FA3' : '#6B7280'} 
          />
          <ThemedText style={[styles.navText, { color: isDark ? '#8B8FA3' : '#6B7280' }]}>
            {themeMode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </ThemedText>
        </Pressable>
        
        <Pressable onPress={() => router.push('/login')} style={({ pressed }) => [styles.navItem, pressed && { opacity: 0.7 }]}>
          <IconSymbol size={24} name="person.circle" color={isDark ? '#8B8FA3' : '#6B7280'} />
          <ThemedText style={[styles.navText, { color: isDark ? '#8B8FA3' : '#6B7280' }]}>
            로그인
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 250,
    height: '100%',
    borderRightWidth: 1,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  topSection: {
    gap: 32,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    gap: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  navContainer: {
    gap: 8,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  navText: {
    fontSize: 16,
  },
  bottomSection: {
    gap: 8,
  },
});
