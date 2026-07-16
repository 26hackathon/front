import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import 'react-native-reanimated';

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  document.body.style.overflowX = 'hidden';
  document.documentElement.style.overflowX = 'hidden';
}

import { useColorScheme } from '@/hooks/use-color-scheme';
import { ThemeProvider } from '@/store/theme-store';
import { AuthProvider } from '@/store/auth-context';
import { ProgressProvider } from '@/store/progress-context';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="create-post" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-profile" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ProgressProvider>
          <RootLayoutNav />
        </ProgressProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
