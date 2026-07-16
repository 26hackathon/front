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
import { useAppStyles } from '@/hooks/use-app-styles';

type Tab = 'find-id' | 'find-password';

export default function AccountRecoveryScreen() {
  const [activeTab, setActiveTab] = useState<Tab>('find-id');
  const [tabWidth, setTabWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const styles = useAppStyles(createStyles);

  const handleTabSwitch = (tab: Tab) => {
    setActiveTab(tab);
    Animated.spring(slideAnim, {
      toValue: tab === 'find-id' ? 0 : 1,
      useNativeDriver: true,
      bounciness: 0,
      speed: 14,
    }).start();
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
            style={styles.tabContainer}
            onLayout={(e: LayoutChangeEvent) => {
              setTabWidth((e.nativeEvent.layout.width - 8) / 2); // 8 is total horizontal padding
            }}
          >
            {/* Sliding Highlight Box */}
            <Animated.View
              style={[
                styles.activeTabIndicator,
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
                  { color: activeTab === 'find-id' ? '#FFFFFF' : styles.tabInactiveText.color },
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
                  { color: activeTab === 'find-password' ? '#FFFFFF' : styles.tabInactiveText.color },
                ]}
              >
                비밀번호 찾기
              </ThemedText>
            </Pressable>
          </View>

          {/* Content */}
          <View style={styles.formCard}>
            {activeTab === 'find-id' ? (
              <FindIdForm styles={styles} />
            ) : (
              <FindPasswordForm styles={styles} />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function FindIdForm({ styles }: { styles: any }) {
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
        <Ionicons name="search-outline" size={36} color={styles.primaryColor.color} />
        <ThemedText style={styles.formTitle}>아이디 찾기</ThemedText>
        <ThemedText style={styles.formDescription}>
          가입 시 등록한 이메일을 입력하시면{'\n'}아이디를 알려드립니다.
        </ThemedText>
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>이메일</ThemedText>
        <View style={[styles.inputContainer, {
          borderColor: emailError ? '#EF4444' : styles.inputBorder.color,
        }]}>
          <Ionicons
            name="mail-outline"
            size={20}
            color={emailError ? '#EF4444' : styles.placeholderIcon.color}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="이메일을 입력하세요"
            placeholderTextColor={styles.placeholderIcon.color}
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
            backgroundColor: pressed ? '#D02E2E' : styles.primaryColor.color,
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

function FindPasswordForm({ styles }: { styles: any }) {
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
        <Ionicons name="key-outline" size={36} color={styles.primaryColor.color} />
        <ThemedText style={styles.formTitle}>비밀번호 찾기</ThemedText>
        <ThemedText style={styles.formDescription}>
          {!showEmailField
            ? '아이디를 먼저 입력해주세요.'
            : '가입 시 등록한 이메일을 입력해주세요.'}
        </ThemedText>
      </View>

      {/* User ID Input */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>아이디</ThemedText>
        <View style={styles.inputContainer}>
          <Ionicons
            name="person-outline"
            size={20}
            color={styles.placeholderIcon.color}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="아이디를 입력하세요"
            placeholderTextColor={styles.placeholderIcon.color}
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
          <ThemedText style={styles.label}>이메일</ThemedText>
          <View style={[styles.inputContainer, {
            borderColor: emailError ? '#EF4444' : styles.inputBorder.color,
          }]}>
            <Ionicons
              name="mail-outline"
              size={20}
              color={emailError ? '#EF4444' : styles.placeholderIcon.color}
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="이메일을 입력하세요"
              placeholderTextColor={styles.placeholderIcon.color}
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
            backgroundColor: pressed ? '#D02E2E' : styles.primaryColor.color,
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
          <ThemedText style={styles.backLinkText}>
            아이디 다시 입력
          </ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────

const createStyles = (colors: any) => StyleSheet.create({
  tabInactiveText: {
    color: colors.textMuted,
  },
  primaryColor: {
    color: colors.primary,
  },
  inputBorder: {
    color: colors.border,
  },
  placeholderIcon: {
    color: colors.textMuted,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: colors.cardSecondary,
  },
  activeTabIndicator: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 4,
    width: '50%',
    borderRadius: 10,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
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
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.primary,
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
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardSecondary,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
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
    color: colors.textMuted,
  },
});
