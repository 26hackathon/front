import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ColorsType = typeof Colors.light;

export function useAppStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  createStyles: (colors: ColorsType) => T
): T {
  const theme = useColorScheme();
  const colors = Colors[theme];
  return useMemo(() => createStyles(colors), [colors, createStyles]);
}
