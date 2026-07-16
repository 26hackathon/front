import { StyleSheet, Pressable, View, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';

type ScreenHeaderProps = {
  title: string;
};

/**
 * Reusable screen header with back button and centered title.
 * Used across auth screens (register, find-id, find-password, etc.)
 */
export function ScreenHeader({ title }: ScreenHeaderProps) {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const textColor = isDark ? '#ECEDEE' : '#11181C';

  return (
    <View style={styles.topBar}>
      <Pressable
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Ionicons name="chevron-back" size={24} color={textColor} />
      </Pressable>
      <ThemedText style={styles.topTitle}>{title}</ThemedText>
      {/* Spacer for centering the title */}
      <View style={styles.backButton} />
    </View>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
});
