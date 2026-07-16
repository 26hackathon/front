/**
 * Returns the resolved color scheme, respecting the user's in-app theme preference.
 * Falls back to the system color scheme when mode is 'system'.
 */
import { useAppTheme } from '@/store/theme-store';

export function useColorScheme() {
  const { resolvedTheme } = useAppTheme();
  return resolvedTheme;
}
