import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  Pressable,
  View,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { useAppStyles } from '@/hooks/use-app-styles';

type LoginFormProps = {
  onLogin: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onLogin, onGoogleLogin }: LoginFormProps) {
  const styles = useAppStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const handleSubmit = () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('알림', '이메일과 비밀번호를 입력해주세요.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      Alert.alert('알림', '올바른 이메일 형식이 아닙니다.');
      return;
    }
    onLogin(email, password);
  };

  return (
    <View>
      {/* Email Input */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>이메일</ThemedText>
        <View style={[styles.inputContainer, {
          borderColor: isEmailFocused ? styles.inputBorderActive.color : styles.inputBorder.color,
        }]}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={isEmailFocused ? styles.inputBorderActive.color : styles.placeholderIcon.color}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="이메일을 입력하세요"
            placeholderTextColor={styles.placeholderIcon.color}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            onFocus={() => setIsEmailFocused(true)}
            onBlur={() => setIsEmailFocused(false)}
          />
        </View>
      </View>

      {/* Password Input */}
      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>비밀번호</ThemedText>
        <View style={[styles.inputContainer, {
          borderColor: isPasswordFocused ? styles.inputBorderActive.color : styles.inputBorder.color,
        }]}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={isPasswordFocused ? styles.inputBorderActive.color : styles.placeholderIcon.color}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor={styles.placeholderIcon.color}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            onFocus={() => setIsPasswordFocused(true)}
            onBlur={() => setIsPasswordFocused(false)}
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={styles.placeholderIcon.color}
            />
          </Pressable>
        </View>
      </View>

      {/* Login Button */}
      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [
          styles.loginButton,
          {
            backgroundColor: pressed ? '#D02E2E' : styles.loginButtonBg.color,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <ThemedText style={styles.loginButtonText}>로그인</ThemedText>
      </Pressable>

      {onGoogleLogin && (
        <>
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <ThemedText style={styles.dividerText}>또는</ThemedText>
            <View style={styles.divider} />
          </View>

          <Pressable
            onPress={onGoogleLogin}
            style={({ pressed }) => [
              styles.googleButton,
              {
                backgroundColor: pressed ? styles.inputBorder.color : styles.googleButton.backgroundColor,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Ionicons name="logo-google" size={18} color={styles.googleButtonContent.color} style={{ marginRight: 8 }} />
            <ThemedText style={styles.googleButtonText}>
              Google로 시작하기
            </ThemedText>
          </Pressable>
        </>
      )}
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  placeholderIcon: {
    color: colors.textMuted,
  },
  inputBorderActive: {
    color: colors.primary,
  },
  inputBorder: {
    color: colors.border,
  },
  loginButtonBg: {
    color: colors.primary,
  },
  googleButtonContent: {
    color: colors.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    height: '100%',
  },
  eyeButton: {
    padding: 4,
  },
  loginButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  googleButton: {
    height: 52,
    backgroundColor: colors.cardSecondary,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 15,
    color: colors.text,
    fontWeight: '700',
  },
});
