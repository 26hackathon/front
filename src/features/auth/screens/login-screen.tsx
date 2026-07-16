import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { LoginForm } from '@/features/auth/components/login-form';
import { useResponsive } from '@/hooks/use-responsive';
import { API_BASE_URL, fetchApi } from '@/lib/api';
import { useAuth } from '@/store/auth-context';
import { useAppStyles } from '@/hooks/use-app-styles';
import * as WebBrowser from 'expo-web-browser';

export default function LoginScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const { login } = useAuth();
  const styles = useAppStyles(createStyles);

  const handleLogin = async (email: string, password: string) => {
    try {
      const response = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.accessToken && response.refreshToken) {
        await login(
          response.accessToken,
          response.refreshToken,
          response.nickname,
          response.userId,
          response.profileImageUrl
        );
        router.replace('/');
      }
    } catch (error: any) {
      Alert.alert('로그인 실패', error.data?.message || '이메일 또는 비밀번호가 일치하지 않습니다.');
    }
  };

  const parseQueryParams = (url: string) => {
    const params: { [key: string]: string } = {};
    const parts = url.split(/[?#]/);
    if (parts.length > 1) {
      const queryString = parts[1];
      const pairs = queryString.split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key && value) {
          params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
      }
    }
    return params;
  };

  const handleGoogleLogin = async () => {
    try {
      const redirectUri = 'hackathonapp://';
      const authUrl = `${API_BASE_URL}/auth/oauth/google/authorize?redirect_uri=${encodeURIComponent(redirectUri)}`;
      
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        redirectUri
      );

      if (result.type === 'success' && result.url) {
        const params = parseQueryParams(result.url);
        const { accessToken, refreshToken, nickname, userId, profileImageUrl } = params;

        if (accessToken && refreshToken) {
          const parsedUserId = userId ? parseInt(userId, 10) : undefined;
          
          await login(
            accessToken,
            refreshToken,
            nickname || undefined,
            parsedUserId,
            profileImageUrl || null
          );
          
          router.replace('/');
        } else {
          Alert.alert('로그인 오류', '구글 로그인 응답에 토큰이 누락되었습니다.');
        }
      }
    } catch (error: any) {
      console.error('Google OAuth Error:', error);
      Alert.alert('로그인 오류', '구글 로그인 중 에러가 발생했습니다.');
    }
  };

  const renderForm = () => (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, isDesktop && styles.scrollContentDesktop]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Back Button */}
      {!isDesktop && (
        <Pressable
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/');
            }
          }}
          style={({ pressed }) => [
            styles.backButton,
            { opacity: pressed ? 0.6 : 1 },
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={styles.iconColor.color}
          />
        </Pressable>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: styles.brandIconBg.color }]}>
          <Ionicons name="cube-outline" size={60} color={styles.brandText.color} />
        </View>
        <ThemedText style={styles.title}>깨다 <ThemedText style={styles.brandText}>GGÆDA</ThemedText></ThemedText>
        <ThemedText style={styles.subtitle}>
          비전 분석 기반 레고 역설계 플랫폼
        </ThemedText>
      </View>

      {/* Form Card */}
      <View style={styles.formCard}>
        <LoginForm onLogin={handleLogin} onGoogleLogin={handleGoogleLogin} />

        {/* Account Recovery Link */}
        <View style={styles.findLinks}>
          <Pressable
            onPress={() => router.push('/account-recovery')}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
          >
            <ThemedText style={styles.findLinkText}>
              아이디찾기/비번찾기
            </ThemedText>
          </Pressable>
        </View>
      </View>

      {/* Register Link */}
      <View style={styles.registerContainer}>
        <ThemedText style={styles.registerText}>
          아직 계정이 없으신가요?
        </ThemedText>
        <Pressable
          onPress={() => router.push('/register')}
          style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
        >
          <ThemedText style={styles.registerLink}>
            회원가입
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );

  if (isDesktop) {
    return (
      <ThemedView style={styles.splitContainer}>
        <View style={styles.leftPane}>
          <LinearGradient
            colors={['#0F1017', '#1E2030']}
            style={styles.gradient}
          >
            <Ionicons name="cube" size={120} color="#FF2E2E" style={styles.brandingIcon} />
            <ThemedText style={styles.brandingTitle}>깨다 GGÆDA</ThemedText>
            <ThemedText style={styles.brandingSubtitle}>
              레고 영상 분석 및 3D 역설계 조립 설명서 변환
            </ThemedText>
          </LinearGradient>
        </View>
        <KeyboardAvoidingView behavior="padding" style={styles.rightPane}>
            <Pressable
            onPress={() => router.push('/')}
            style={({ pressed }) => [styles.desktopHomeBtn, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Ionicons name="home-outline" size={24} color={styles.desktopHomeIcon.color} />
            <ThemedText style={styles.desktopHomeText}>홈으로</ThemedText>
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
        style={styles.keyboardView}
      >
        {renderForm()}
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  iconColor: {
    color: colors.text,
  },
  brandIconBg: {
    color: colors.primary + '15',
  },
  brandText: {
    color: colors.primary,
  },
  desktopHomeIcon: {
    color: colors.textMuted,
  },
  desktopHomeText: {
    color: colors.textMuted,
    marginLeft: 8,
    fontWeight: '600',
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 40,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 480,
    ...(Platform.OS === 'web' && { marginHorizontal: 'auto' }),
  },
  scrollContentDesktop: {
    paddingTop: 80,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: colors.cardSecondary,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.text,
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  formCard: {
    borderRadius: 24,
    padding: 24,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
  },
  findLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  findLinkText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    gap: 6,
  },
  registerText: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '600',
  },
  registerLink: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  splitContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.background,
  },
  leftPane: {
    flex: 1,
  },
  rightPane: {
    width: 500,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    position: 'relative',
    backgroundColor: colors.background,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  brandingIcon: {
    marginBottom: 24,
  },
  brandingTitle: {
    fontSize: 36,
    fontWeight: '900',
    color: '#FFF', // Keeping left pane dark theme aesthetic
    marginBottom: 16,
  },
  brandingSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  desktopHomeBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 10,
  },
});
