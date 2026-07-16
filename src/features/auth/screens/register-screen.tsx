import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from 'react-native';

import { ScreenHeader } from '@/components/layout/screen-header';
import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useResponsive } from '@/hooks/use-responsive';
import { fetchApi } from '@/lib/api';
import { useAuth } from '@/store/auth-context';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { login } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState('');

  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordConfirmFocused, setIsPasswordConfirmFocused] = useState(false);
  const [isNameFocused, setIsNameFocused] = useState(false);
  const [isUrlFocused, setIsUrlFocused] = useState(false);

  const hasSequentialChars = (str: string) => {
    if (/(.)\1\1/.test(str)) return true; // e.g. 111, aaa
    for (let i = 0; i < str.length - 2; i++) {
      const char1 = str.charCodeAt(i);
      const char2 = str.charCodeAt(i + 1);
      const char3 = str.charCodeAt(i + 2);
      if (char2 === char1 + 1 && char3 === char2 + 1) return true; // e.g. 123, abc
      if (char2 === char1 - 1 && char3 === char2 - 1) return true; // e.g. 321, cba
    }
    return false;
  };

  const getPasswordError = (pwd: string) => {
    if (!pwd) return '';
    if (pwd.length < 8 || pwd.length > 100) return '8~100자의 비밀번호를 사용해 주세요.';
    const emailPrefix = email.split('@')[0];
    if (emailPrefix && pwd.includes(emailPrefix)) return '이메일 아이디가 포함된 비밀번호는 사용할 수 없습니다.';
    if (hasSequentialChars(pwd)) return '연속된 문자나 숫자는 사용할 수 없습니다.';
    return '';
  };

  const passwordError = getPasswordError(password);
  const passwordMatchError = passwordConfirm.length > 0 && password !== passwordConfirm;
  const emailError = email.length > 0 && !EMAIL_REGEX.test(email);
  const nameError = name.length > 30 ? '닉네임은 30자 이하이어야 합니다.' : '';

  const colors = {
    primary: '#FF2E2E',
    primaryDark: '#D02E2E',
    inputBg: '#0F1017',
    inputBorder: '#2A2D3E',
    inputBorderActive: '#FF2E2E',
    inputText: '#ECEDEE',
    placeholder: '#8B8FA3',
    cardBg: '#161825',
    subtleText: '#8B8FA3',
    error: '#EF4444',
    success: '#10B981',
  };

  const handleNext = async () => {
    if (step === 1 && email.trim() && !emailError) setStep(2);
    else if (step === 2 && password && !passwordError && password === passwordConfirm) setStep(3);
    else if (step === 3 && name.trim() && !nameError) {
      setIsSubmitting(true);
      try {
        const requestBody: any = {
          email: email,
          password: password,
          nickname: name,
          profileImageUrl: profileImageUrl.trim() || 'https://example.com/profile.png',
        };

        const response = await fetchApi('/auth/signup', {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
        
        if (response.accessToken && response.refreshToken) {
          await login(
            response.accessToken,
            response.refreshToken,
            response.nickname,
            response.userId,
            response.profileImageUrl
          );
        }
        setStep(4);
      } catch (error: any) {
        console.error('회원가입 에러 상세:', error);
        
        let errorMessage = '회원가입 중 오류가 발생했습니다.';
        if (error && error.data) {
          if (typeof error.data === 'string') {
            errorMessage = error.data;
          } else if (typeof error.data === 'object') {
            if (error.data.message) {
              errorMessage = error.data.message;
            } else if (error.data.error) {
              errorMessage = error.data.error;
            }
            
            // Handle array of validation errors
            if (Array.isArray(error.data.errors)) {
              const details = error.data.errors
                .map((err: any) => typeof err === 'string' ? err : `${err.field || ''}: ${err.defaultMessage || err.reason || ''}`)
                .join('\n');
              if (details) {
                errorMessage += `\n\n상세 정보:\n${details}`;
              }
            } else if (error.data.errors && typeof error.data.errors === 'object') {
              const details = Object.entries(error.data.errors)
                .map(([field, reason]) => `${field}: ${reason}`)
                .join('\n');
              if (details) {
                errorMessage += `\n\n상세 정보:\n${details}`;
              }
            }
          }
        }
        
        Alert.alert(
          `회원가입 실패 (상태 코드: ${error.status || '알 수 없음'})`,
          errorMessage
        );
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1 && step < 4) setStep(step - 1);
    else router.back();
  };

  const renderStepIndicator = () => {
    if (step === 4) return null;
    return (
      <View style={styles.indicatorContainer}>
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={[
              styles.indicatorDot,
              { backgroundColor: s <= step ? colors.primary : colors.inputBorder },
            ]}
          />
        ))}
      </View>
    );
  };

  const isNextDisabled = () => {
    if (isSubmitting) return true;
    if (step === 1) return !email.trim() || emailError;
    if (step === 2) return !password || !!passwordError || password !== passwordConfirm;
    if (step === 3) return !name.trim() || !!nameError;
    return false;
  };

  const renderForm = () => (
    <>
      {step < 4 ? (
        <View style={styles.headerWrapper}>
          {!isDesktop && (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.inputText} />
            </Pressable>
          )}
          {isDesktop && step > 1 && (
            <Pressable
              onPress={handleBack}
              style={({ pressed }) => [
                styles.backButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Ionicons name="chevron-back" size={24} color={colors.inputText} />
            </Pressable>
          )}
          {isDesktop && step === 1 && <View style={styles.backButton} />}

          <ThemedText style={styles.headerTitle}>회원가입</ThemedText>
          <View style={styles.backButton} />
        </View>
      ) : (
        <ScreenHeader title="가입 완료" />
      )}

      <ScrollView
        contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {renderStepIndicator()}

        <View style={[styles.formCard, {
          backgroundColor: colors.cardBg,
          borderColor: colors.inputBorder,
        }]}>
          {step === 1 && (
            <View>
              <ThemedText style={styles.stepTitle}>이메일을 입력해주세요</ThemedText>
              <ThemedText style={[styles.stepSubtitle, { color: colors.subtleText }]}>
                로그인 시 아이디로 사용할 이메일입니다.
              </ThemedText>
              <View style={[styles.inputContainer, {
                backgroundColor: colors.inputBg,
                borderColor: emailError ? colors.error : (isEmailFocused ? colors.inputBorderActive : colors.inputBorder),
              }]}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={emailError ? colors.error : (isEmailFocused ? colors.primary : colors.placeholder)}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="example@email.com"
                  placeholderTextColor={colors.placeholder}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => setIsEmailFocused(false)}
                  autoFocus
                />
              </View>
              {emailError && (
                <ThemedText style={[styles.errorText, { color: colors.error }]}>
                  유효한 이메일 형식이 아닙니다.
                </ThemedText>
              )}
            </View>
          )}

          {step === 2 && (
            <View>
              <ThemedText style={styles.stepTitle}>비밀번호를 설정해주세요</ThemedText>
              <ThemedText style={[styles.stepSubtitle, { color: colors.subtleText }]}>
                8~100자의 비밀번호
              </ThemedText>

              <View style={[styles.inputContainer, styles.marginBottom, {
                backgroundColor: colors.inputBg,
                borderColor: passwordError ? colors.error : (isPasswordFocused ? colors.inputBorderActive : colors.inputBorder),
              }]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={passwordError ? colors.error : (isPasswordFocused ? colors.primary : colors.placeholder)}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="비밀번호"
                  placeholderTextColor={colors.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  autoFocus
                />
              </View>
              {!!passwordError && (
                <ThemedText style={[styles.errorText, { color: colors.error, marginBottom: 16, marginTop: -8 }]}>
                  {passwordError}
                </ThemedText>
              )}

              <View style={[styles.inputContainer, {
                backgroundColor: colors.inputBg,
                borderColor: passwordMatchError ? colors.error : (isPasswordConfirmFocused ? colors.inputBorderActive : colors.inputBorder),
              }]}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={18}
                  color={passwordMatchError ? colors.error : (isPasswordConfirmFocused ? colors.primary : colors.placeholder)}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={[styles.input, { color: colors.inputText }]}
                  placeholder="비밀번호 확인"
                  placeholderTextColor={colors.placeholder}
                  value={passwordConfirm}
                  onChangeText={setPasswordConfirm}
                  secureTextEntry
                  onFocus={() => setIsPasswordConfirmFocused(true)}
                  onBlur={() => setIsPasswordConfirmFocused(false)}
                />
              </View>
              {passwordMatchError && (
                <ThemedText style={[styles.errorText, { color: colors.error }]}>
                  비밀번호가 일치하지 않습니다.
                </ThemedText>
              )}
            </View>
          )}

          {step === 3 && (
            <View>
              <ThemedText style={styles.stepTitle}>프로필 정보를 입력해주세요</ThemedText>
              <ThemedText style={[styles.stepSubtitle, { color: colors.subtleText }]}>
                닉네임과 프로필 이미지 URL을 입력해주세요.
              </ThemedText>

              {/* Nickname */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.subtleText }]}>닉네임</ThemedText>
                <View style={[styles.inputContainer, {
                  backgroundColor: colors.inputBg,
                  borderColor: nameError ? colors.error : (isNameFocused ? colors.inputBorderActive : colors.inputBorder),
                }]}>
                  <Ionicons
                    name="person-outline"
                    size={18}
                    color={isNameFocused ? colors.primary : colors.placeholder}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.inputText }]}
                    placeholder="닉네임 입력 (최대 30자)"
                    placeholderTextColor={colors.placeholder}
                    value={name}
                    onChangeText={setName}
                    maxLength={30}
                    onFocus={() => setIsNameFocused(true)}
                    onBlur={() => setIsNameFocused(false)}
                    autoFocus
                  />
                </View>
                {!!nameError && (
                  <ThemedText style={[styles.errorText, { color: colors.error }]}>
                    {nameError}
                  </ThemedText>
                )}
              </View>

              {/* Profile Image URL */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: colors.subtleText }]}>프로필 이미지 URL (선택)</ThemedText>
                <View style={[styles.inputContainer, {
                  backgroundColor: colors.inputBg,
                  borderColor: isUrlFocused ? colors.inputBorderActive : colors.inputBorder,
                }]}>
                  <Ionicons
                    name="image-outline"
                    size={18}
                    color={isUrlFocused ? colors.primary : colors.placeholder}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={[styles.input, { color: colors.inputText }]}
                    placeholder="https://example.com/profile.png"
                    placeholderTextColor={colors.placeholder}
                    value={profileImageUrl}
                    onChangeText={setProfileImageUrl}
                    keyboardType="url"
                    autoCapitalize="none"
                    onFocus={() => setIsUrlFocused(true)}
                    onBlur={() => setIsUrlFocused(false)}
                  />
                </View>
              </View>
            </View>
          )}

          {step === 4 && (
            <View style={styles.successContainer}>
              <Ionicons name="checkmark-circle" size={80} color={colors.success} />
              <ThemedText style={styles.stepTitle}>가입이 완료되었습니다!</ThemedText>
              <ThemedText style={[styles.stepSubtitle, { color: colors.subtleText }]}>
                {name}님, 환영합니다.{'\n'}이제 깨다의 3D 역설계 서비스를 이용해 보세요.
              </ThemedText>
            </View>
          )}

          <Pressable
            onPress={step === 4 ? () => router.replace('/login') : handleNext}
            disabled={isNextDisabled()}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: isNextDisabled() ? colors.inputBorder : (pressed ? colors.primaryDark : colors.primary),
                transform: [{ scale: pressed && !isNextDisabled() ? 0.98 : 1 }],
              },
            ]}
          >
            <ThemedText style={[
              styles.submitButtonText,
              { color: isNextDisabled() ? colors.subtleText : '#FFFFFF' }
            ]}>
              {step === 3 ? (isSubmitting ? '가입 진행 중...' : '가입하기') : step === 4 ? '로그인하러 가기' : '다음'}
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );

  if (isDesktop) {
    return (
      <ThemedView style={styles.splitContainer}>
        <View style={styles.leftPane}>
          <LinearGradient
            colors={['#0F1017', '#1E2030']}
            style={styles.gradient}
          >
            <Ionicons name="person-add" size={120} color="#FF2E2E" style={styles.brandingIcon} />
            <ThemedText style={styles.brandingTitle}>깨다 GGÆDA</ThemedText>
            <ThemedText style={styles.brandingSubtitle}>
              간편하게 회원가입을 마치고 레고 조립 설명서 추출을 시작해보세요
            </ThemedText>
          </LinearGradient>
        </View>
        <KeyboardAvoidingView behavior="padding" style={styles.rightPane}>
          <Pressable
            onPress={() => router.push('/login')}
            style={({ pressed }) => [styles.desktopHomeBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <ThemedText style={{ color: colors.subtleText, marginRight: 8, fontWeight: '600' }}>로그인</ThemedText>
            <Ionicons name="arrow-forward" size={20} color={colors.subtleText} />
          </Pressable>
          {renderForm()}
        </KeyboardAvoidingView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        {renderForm()}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1017',
    overflow: 'hidden',
  },
  headerWrapper: {
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
    backgroundColor: '#1E2030',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    ...(Platform.OS === 'web' && { marginHorizontal: 'auto' }),
  },
  scrollContentDesktop: {
    justifyContent: 'center',
    paddingTop: 60,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  indicatorDot: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    maxWidth: 40,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
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
  marginBottom: {
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: '100%',
  },
  errorText: {
    fontSize: 13,
    marginTop: 6,
    marginLeft: 4,
  },
  submitButton: {
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#FF2E2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 16,
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
    backgroundColor: '#0F1017',
  },
  leftPane: {
    flex: 1,
    display: 'flex',
  },
  rightPane: {
    flex: 1,
    display: 'flex',
    backgroundColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    borderLeftWidth: 1,
    borderLeftColor: '#2A2D3E',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  brandingIcon: {
    marginBottom: 32,
  },
  brandingTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 16,
    letterSpacing: -1,
  },
  brandingSubtitle: {
    fontSize: 16,
    color: '#8B8FA3',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  desktopHomeBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 40,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    zIndex: 10,
    backgroundColor: '#1E2030',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2A2D3E',
  },
});
