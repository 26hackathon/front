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

type LoginFormProps = {
  onLogin: (email: string, password: string) => void;
  onGoogleLogin?: () => void;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onLogin, onGoogleLogin }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const colors = {
    primary: '#FF2E2E',
    primaryDark: '#D02E2E',
    inputBg: '#0F1017',
    inputBorder: '#2A2D3E',
    inputBorderActive: '#FF2E2E',
    inputText: '#ECEDEE',
    placeholder: '#8B8FA3',
    subtleText: '#8B8FA3',
  };

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
        <ThemedText style={[styles.label, { color: colors.subtleText }]}>이메일</ThemedText>
        <View style={[styles.inputContainer, {
          backgroundColor: colors.inputBg,
          borderColor: isEmailFocused ? colors.inputBorderActive : colors.inputBorder,
        }]}>
          <Ionicons
            name="mail-outline"
            size={18}
            color={isEmailFocused ? colors.primary : colors.placeholder}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder="이메일을 입력하세요"
            placeholderTextColor={colors.placeholder}
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
        <ThemedText style={[styles.label, { color: colors.subtleText }]}>비밀번호</ThemedText>
        <View style={[styles.inputContainer, {
          backgroundColor: colors.inputBg,
          borderColor: isPasswordFocused ? colors.inputBorderActive : colors.inputBorder,
        }]}>
          <Ionicons
            name="lock-closed-outline"
            size={18}
            color={isPasswordFocused ? colors.primary : colors.placeholder}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, { color: colors.inputText }]}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor={colors.placeholder}
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
              color={colors.placeholder}
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
            backgroundColor: pressed ? colors.primaryDark : colors.primary,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <ThemedText style={styles.loginButtonText}>로그인</ThemedText>
      </Pressable>

      {onGoogleLogin && (
        <>
          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />
            <ThemedText style={[styles.dividerText, { color: colors.subtleText }]}>또는</ThemedText>
            <View style={[styles.divider, { backgroundColor: colors.inputBorder }]} />
          </View>

          <Pressable
            onPress={onGoogleLogin}
            style={({ pressed }) => [
              styles.googleButton,
              {
                backgroundColor: '#1E2030',
                borderColor: '#2A2D3E',
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Ionicons name="logo-google" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
            <ThemedText style={[styles.googleButtonText, { color: '#FFFFFF' }]}>
              Google로 시작하기
            </ThemedText>
          </Pressable>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    shadowColor: '#FF2E2E',
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
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 13,
    fontWeight: '600',
  },
  googleButton: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
});
