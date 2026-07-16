import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Alert,
  Animated,
} from 'react-native';
import { useEffect, useRef } from 'react';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import {
  ActivityItem,
  MOCK_ACCOUNT_SETTINGS,
  MOCK_ACTIVE_PROJECT,
  MOCK_ACTIVITY,
  MOCK_APP_SETTINGS,
  MOCK_USER_STATS,
  SettingItem,
} from '@/data/mockData';
import { useAuth } from '@/store/auth-context';
import { useAppTheme } from '@/store/theme-store';
import { useProgress } from '@/store/progress-context';
import { useAppStyles } from '@/hooks/use-app-styles';

// Animated Custom Switch Component
const AnimatedSwitch = ({ value, onValueChange }: { value: boolean; onValueChange: () => void }) => {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      bounciness: 8,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#8B8FA3', '#FF2E2E'], // Gray when off, Red when on
  });

  return (
    <Pressable onPress={onValueChange} style={{ padding: 4 }}>
      <Animated.View style={{
        width: 44,
        height: 24,
        borderRadius: 12,
        backgroundColor,
        justifyContent: 'center',
      }}>
        <Animated.View style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          backgroundColor: '#FFFFFF',
          transform: [{ translateX }],
        }} />
      </Animated.View>
    </Pressable>
  );
};

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { resolvedTheme, setThemeMode } = useAppTheme();
  const { inProgressPosts, activityLogs } = useProgress();
  const styles = useAppStyles(createStyles);

  const handleLogout = async () => {
    await logout();
    router.replace('/');
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* HEADER SECTION */}
        <View style={styles.headerRow}>
          <ThemedText style={styles.headerTitle}>프로필</ThemedText>
        </View>

        {/* PROFILE INFO CONTAINER */}
        <View style={styles.profileInfoContainer}>

          {/* Avatar Container with Red Camera Badge */}
          <View style={styles.avatarWrapper}>
            {user ? (
              <>
                <Image
                  source={{ uri: user.profileImageUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
                  style={styles.avatar}
                />
                <View style={styles.cameraBadge}>
                  <Ionicons name="camera" size={11} color="#FFFFFF" />
                </View>
              </>
            ) : (
              <View style={[styles.avatar, styles.emptyAvatar]}>
                <Ionicons name="person" size={32} color="#8B8FA3" />
              </View>
            )}
          </View>

          {/* Nickname, ID, Badges */}
          <View style={styles.userDetails}>
            <View style={styles.nameRow}>
              <ThemedText style={styles.nicknameText}>{user ? (user.nickname || '김레고') : '로그인 안됨'}</ThemedText>
              {user && (
                <Pressable style={styles.editBtn} onPress={() => router.push('/edit-profile')}>
                  <Ionicons name="pencil-outline" size={14} color="#8B8FA3" />
                </Pressable>
              )}
            </View>
            <ThemedText style={styles.subtext}>
              {user ? `${user.id ? `lego_user_${user.id}` : 'lego_master_kr'} · 가입 2023년 3월` : '로그인이 필요합니다'}
            </ThemedText>

            {user && (
              <View style={styles.badgeRow}>
                <View style={styles.masterBadge}>
                  <ThemedText style={styles.masterBadgeText}>MASTER</ThemedText>
                </View>
                <View style={styles.levelBadge}>
                  <ThemedText style={styles.levelBadgeText}>Lv. 24</ThemedText>
                </View>
              </View>
            )}
          </View>

        </View>

        {/* STATS ROW CARD */}
        {user && (
          <View style={styles.statsCard}>
            <View style={styles.statCol}>
              <ThemedText style={styles.statValue}>{MOCK_USER_STATS.completedSets}</ThemedText>
              <ThemedText style={styles.statLabel}>완성한 세트</ThemedText>
            </View>
            <View style={styles.dividerCol} />
            <View style={styles.statCol}>
              <ThemedText style={styles.statValue}>{MOCK_USER_STATS.totalBricks}</ThemedText>
              <ThemedText style={styles.statLabel}>조립한 브릭</ThemedText>
            </View>
            <View style={styles.dividerCol} />
            <View style={styles.statCol}>
              <ThemedText style={styles.statValue}>{MOCK_USER_STATS.scanAccuracy}</ThemedText>
              <ThemedText style={styles.statLabel}>인식 정확도</ThemedText>
            </View>
          </View>
        )}

        {/* SECTION: ONGOING PROJECT — from Context */}
        {user && inProgressPosts.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>진행 중인 프로젝트</ThemedText>
            {inProgressPosts.map(post => (
              <View key={post.id} style={[styles.projectCard, { marginBottom: 10 }]}>
                {/* <Image source={{ uri: post.thumbnailImageUrl }} style={styles.projectBg} />
                <View style={styles.projectOverlay} /> */}
                <View style={styles.projectContent}>
                  <ThemedText style={styles.projectMeta}>{new Date(post.createdAt).toLocaleDateString()}</ThemedText>
                  <ThemedText style={styles.projectTitle}>{post.title}</ThemedText>
                  <ThemedText style={styles.projectStep}>진행 중</ThemedText>
                </View>
                <Pressable style={styles.arrowBtn} onPress={() => router.push('/assembly')}>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {/* SECTION: RECENT ACTIVITY — from Context */}
        {user && activityLogs.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>최근 활동</ThemedText>
            <View style={styles.cardContainer}>
              {activityLogs.map((act, idx) => {
                const isStart = act.action === 'STARTED';
                return (
                  <View key={act.id}>
                    <View style={styles.activityRow}>
                      <View style={[styles.dot, { backgroundColor: isStart ? '#FF2E2E' : '#8B8FA3' }]} />
                      <ThemedText style={styles.activityText}>
                        {act.postTitle} {isStart ? '시작' : '종료'}
                      </ThemedText>
                      <ThemedText style={styles.activityTime}>{new Date(act.occurredAt).toLocaleDateString()}</ThemedText>
                    </View>
                    {idx < activityLogs.length - 1 && <View style={styles.innerDivider} />}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* SECTION: APP SETTINGS — from MOCK_APP_SETTINGS */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>앱 설정</ThemedText>
          <View style={styles.cardContainer}>
            {MOCK_APP_SETTINGS.map((setting: SettingItem, idx: number) => {
              const isDarkModeSetting = setting.id === 'setting-dark';
              
              return (
                <View key={setting.id}>
                  <Pressable 
                    style={styles.settingRow} 
                    onPress={() => {
                      if (isDarkModeSetting) {
                        setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark');
                      } else {
                        Alert.alert(setting.title, '준비 중입니다.');
                      }
                    }}
                  >
                    <View style={[styles.iconBox, { backgroundColor: setting.iconColor }]}>
                      <Ionicons name={setting.icon as any} size={16} color="#FFFFFF" />
                    </View>
                    <View style={styles.settingMeta}>
                      <ThemedText style={styles.settingTitle}>{setting.title}</ThemedText>
                      {setting.subtitle && (
                        <ThemedText style={styles.settingSub}>
                          {isDarkModeSetting 
                            ? (resolvedTheme === 'dark' ? '켜짐' : '꺼짐') 
                            : setting.subtitle}
                        </ThemedText>
                      )}
                    </View>
                    {isDarkModeSetting ? (
                      <AnimatedSwitch 
                        value={resolvedTheme === 'dark'} 
                        onValueChange={() => setThemeMode(resolvedTheme === 'dark' ? 'light' : 'dark')} 
                      />
                    ) : (
                      <Ionicons name="chevron-forward" size={16} color={styles.arrowIconColor.color} />
                    )}
                  </Pressable>
                  {idx < MOCK_APP_SETTINGS.length - 1 && <View style={styles.innerDivider} />}
                </View>
              );
            })}
          </View>
        </View>

        {/* SECTION: SECURITY & POLICY — from MOCK_ACCOUNT_SETTINGS */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>계정 및 보안</ThemedText>
          <View style={styles.cardContainer}>
            {MOCK_ACCOUNT_SETTINGS.map((setting: SettingItem, idx: number) => (
              <View key={setting.id}>
                <Pressable style={styles.settingRow} onPress={() => Alert.alert(setting.title, '준비 중입니다.')}>
                  <View style={[styles.iconBox, { backgroundColor: setting.iconColor }]}>
                    <Ionicons name={setting.icon as any} size={16} color="#FFFFFF" />
                  </View>
                  <View style={styles.settingMeta}>
                    <ThemedText style={styles.settingTitleTextOnly}>{setting.title}</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#8B8FA3" />
                </Pressable>
                {idx < MOCK_ACCOUNT_SETTINGS.length - 1 && <View style={styles.innerDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* LOGOUT OR LOGIN BUTTON CARD */}
        <Pressable
          onPress={user ? handleLogout : () => router.push('/login')}
          style={({ pressed }) => [styles.logoutCard, pressed && { opacity: 0.8 }]}
        >
          <View style={[styles.logoutIconBox, !user && { backgroundColor: '#10B98115' }]}>
            <Ionicons
              name={user ? "log-out" : "log-in"}
              size={16}
              color={user ? "#FF2E2E" : "#10B981"}
            />
          </View>
          <ThemedText style={[styles.logoutText, !user && { color: '#10B981' }]}>
            {user ? '로그아웃' : '로그인'}
          </ThemedText>
        </Pressable>

        {/* FOOTER METADATA */}
        <ThemedText style={styles.footerText}>BrickFlow AI · 버전 2.1.0</ThemedText>

      </ScrollView>
    </ThemedView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  arrowIconColor: {
    color: colors.textMuted,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 110,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
    gap: 20,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.cardSecondary,
  },
  emptyAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.card,
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.background,
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nicknameText: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  editBtn: {
    padding: 2,
  },
  subtext: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  masterBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  masterBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
  },
  levelBadge: {
    backgroundColor: colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '800',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.text,
  },
  statLabel: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  dividerCol: {
    width: 1,
    height: 30,
    backgroundColor: colors.border,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  projectCard: {
    height: 100,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  projectContent: {
    gap: 2,
  },
  projectMeta: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.text,
  },
  projectStep: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 10,
  },
  activityText: {
    flex: 1,
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  innerDivider: {
    height: 1.5,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingMeta: {
    flex: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  settingSub: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  settingTitleTextOnly: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
    paddingVertical: 4,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    gap: 12,
    marginTop: 4,
  },
  logoutIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 10,
  },
});
