import { Stack } from 'expo-router';

/**
 * Auth route group layout.
 * All authentication screens share this Stack navigator with headers hidden.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="account-recovery" />
    </Stack>
  );
}
