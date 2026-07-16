import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Animated,
  LayoutChangeEvent,
} from 'react-native';

import { ScreenHeader } from '@/components/layout/screen-header';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Tab = 'find-id' | 'find-password';

export default function AccountRecoveryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('find-id');
  const [tabWidth, setTabWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'find-id' ? 0 : 1,
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
    }).start();
  };
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const colors = {
    primary: '#6C63FF',
    primaryDark: '#5A52D5',
    inputBg: isDark ? '#1E2030' : '#F5F6FA',
    inputBorder: isDark ? '#2A2D3E' : '#E4E6EF',
    inputText: isDark ? '#ECEDEE' : '#11181C',
    placeholder: isDark ? '#6B7280' : '#9CA3AF',
    cardBg: isDark ? '#161825' : '#FFFFFF',
    subtleText: isDark ? '#8B8FA3' : '#6B7280',
    tabInactive: isDark ? '#2A2D3E' : '#F0F1F5',
    tabInactiveText: isDark ? '#6B7280' : '#9CA3AF',
  };

  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="계정 찾기" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Tab Switcher */}
          <View 
            style={[styles.tabContainer, { backgroundColor: colors.tabInactive }]}
            onLayout={(e: LayoutChangeEvent) => {
              setTabWidth((e.nativeEvent.layout.width - 8) / 2); // 8 is total horizontal padding
            }}
          >
            {/* Sliding Highlight Box */}
            <Animated.View
              style={[
                styles.activeTabIndicator,
                { backgroundColor: colors.primary },
                {
                  transform: [{
                    translateX: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, tabWidth],
                    })
                  }]
                }
              ]}
            />

            <Pressable
              onPress={() => handleTabSwitch('find-id')}
              style={styles.tab}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'find-id' ? '#FFFFFF' : colors.tabInactiveText },
                ]}
              >
                아이디 찾기
              </ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleTabSwitch('find-password')}
              style={styles.tab}
            >
              <ThemedText
                style={[
                  styles.tabText,
                  { color: activeTab === 'find-password' ? '#FFFFFF' : colors.tabInactiveText },
                ]}
              >
                비밀번호 찾기
              </ThemedText>
            </Pressable>
          </View>

          {/* Content */}
          <View style={[styles.formCard, {
            backgroundColor: colors.cardBg,
            shadowColor: isDark ? '#000' : '#6C63FF',
          }]}>
            {activeTab === 'find-id' ? (
              <FindIdForm colors={colors} />
            ) : (
              <FindPasswordForm colors={colors} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

// ─── Find ID Form ────────────────────────────────────────────

type FormColors = {
  primary: string;
  primaryDark: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;
  subtleText: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FindIdForm({ colors }: { colors: FormColors }) {
  const [email, setEmail] = useState('');
  const emailError = email.length > 0 && !EMAIL_REGEX.test(email);

  const handleFindId = () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (emailError) return;
    // TODO: Implement find ID API call
    Alert.alert('알림', '입력하신 이메일로 아이디 정보를 발송했습니다.');
  };

  return (
    <View>
      <View style={styles.formHeader}>
        <Ionicons name="search-outline" size={36} color={colors.primary} />
        <ThemedText style={styles.formTitle}>아이디 찾기</ThemedText>
        <ThemedText style={[styles.formDescription, { color: colors.subtleText }]}>
          가입 시 등록한 이메일을 입력하시면{'\n'}아이디를 알려드립니다.
        </ThemedText>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={[styles.label, { color: colors.subtleText }]}>이메일</ThemedText>
        <View style={[styles.inputContainer, {
          backgroundColor: colors.inputBg,
          borderColor: emailError ? '#EF4444' : colors.inputBorder,
        }]}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={emailError ? '#EF4444' : colors.placeholder}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder="이메일을 입력하세요"
            placeholderTextColor={colors.placeholder}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
        {emailError && (
          <ThemedText style={styles.errorText}>
            이메일 형식으로 다시 입력해주세요
          </ThemedText>
        )}
      </View>

      <Pressable
        onPress={handleFindId}
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <ThemedText style={styles.submitButtonText}>아이디 찾기</ThemedText>
      </Pressable>
    </View>
  );
}

// ─── Find Password Form ──────────────────────────────────────

function FindPasswordForm({ colors }: { colors: FormColors }) {
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [showEmailField, setShowEmailField] = useState(false);
  const emailError = email.length > 0 && !EMAIL_REGEX.test(email);

  const handleNext = () => {
    if (!userId.trim()) {
      Alert.alert('알림', '아이디를 입력해주세요.');
      return;
    }
    setShowEmailField(true);
  };

  const handleFindPassword = () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요.');
      return;
    }
    if (emailError) return;
    // TODO: Implement find password API call
    Alert.alert('알림', '입력하신 이메일로 비밀번호 재설정 링크를 발송했습니다.');
  };

  return (
    <View>
      <View style={styles.formHeader}>
        <Ionicons name="key-outline" size={36} color={colors.primary} />
        <ThemedText style={styles.formTitle}>비밀번호 찾기</ThemedText>
        <ThemedText style={[styles.formDescription, { color: colors.subtleText }]}>
          {!showEmailField
            ? '아이디를 먼저 입력해주세요.'
            : '가입 시 등록한 이메일을 입력해주세요.'}
        </ThemedText>
      </View>

      {/* User ID Input */}
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.label, { color: colors.subtleText }]}>아이디</ThemedText>
        <View style={[styles.inputContainer, {
          backgroundColor: colors.inputBg,
          borderColor: colors.inputBorder,
        }]}>
          <Ionicons
            name="person-outline"
            size={20}
            color={colors.placeholder}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder="아이디를 입력하세요"
            placeholderTextColor={colors.placeholder}
            value={userId}
            onChangeText={(text) => {
              setUserId(text);
              if (showEmailField) setShowEmailField(false);
            }}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!showEmailField}
          />
        </View>
      </View>

      {/* Email Input (shown after ID entered) */}
      {showEmailField && (
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: colors.subtleText }]}>이메일</ThemedText>
          <View style={[styles.inputContainer, {
            backgroundColor: colors.inputBg,
            borderColor: emailError ? '#EF4444' : colors.inputBorder,
          }]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={emailError ? '#EF4444' : colors.placeholder}
              style={styles.inputIcon}
            />
            <TextInput
              style={[styles.input, { color: colors.inputText }]}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={colors.placeholder}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
            />
          </View>
          {emailError && (
            <ThemedText style={styles.errorText}>
              이메일 형식으로 다시 입력해주세요
            </ThemedText>
          )}
        </View>
      )}

      <Pressable
        onPress={showEmailField ? handleFindPassword : handleNext}
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <ThemedText style={styles.submitButtonText}>
          {showEmailField ? '비밀번호 찾기' : '다음'}
        </ThemedText>
      </Pressable>

      {showEmailField && (
        <Pressable
          onPress={() => setShowEmailField(false)}
          style={({ pressed }) => [
            styles.backLink,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <ThemedText style={[styles.backLinkText, { color: colors.subtleText }]}>
            아이디 다시 입력
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
  },
  tabContainer: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  activeTabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: '50%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '700',
  },
  formCard: {
    borderRadius: 20,
    padding: 24,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: 28,
    gap: 8,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 4,
  },
  formDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
  },
  submitButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  backLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  backLinkText: {
    fontSize: 14,
  },
});
