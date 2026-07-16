import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { useAuth } from '@/store/auth-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

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
          <Pressable style={styles.iconCircle}>
            <Ionicons name="settings" size={18} color="#8B8FA3" />
          </Pressable>
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
                <Pressable style={styles.editBtn}>
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
              <ThemedText style={styles.statValue}>12</ThemedText>
              <ThemedText style={styles.statLabel}>완성한 세트</ThemedText>
            </View>
            <View style={styles.dividerCol} />
            <View style={styles.statCol}>
              <ThemedText style={styles.statValue}>4.2만</ThemedText>
              <ThemedText style={styles.statLabel}>조립한 브릭</ThemedText>
            </View>
            <View style={styles.dividerCol} />
            <View style={styles.statCol}>
              <ThemedText style={styles.statValue}>97.3%</ThemedText>
              <ThemedText style={styles.statLabel}>인식 정확도</ThemedText>
            </View>
          </View>
        )}

        {/* SECTION: ONGOING PROJECT */}
        {user && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>진행 중인 프로젝트</ThemedText>
            <View style={styles.projectCard}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80' }}
                style={styles.projectBg}
              />
              <View style={styles.projectOverlay} />
              <View style={styles.projectContent}>
                <ThemedText style={styles.projectMeta}>Creator Expert 10294</ThemedText>
                <ThemedText style={styles.projectTitle}>Titanic</ThemedText>
                <ThemedText style={styles.projectStep}>Step 31 / 48 - 64%</ThemedText>
              </View>
              <Pressable style={styles.arrowBtn}>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </Pressable>
            </View>
          </View>
        )}

        {/* SECTION: RECENT ACTIVITY */}
        {user && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>최근 활동</ThemedText>
            <View style={styles.cardContainer}>
              
              {/* Act 1 */}
              <View style={styles.activityRow}>
                <View style={[styles.dot, { backgroundColor: '#39D353' }]} />
                <ThemedText style={styles.activityText}>배틀팩 #75267 — 전체 완성</ThemedText>
                <ThemedText style={styles.activityTime}>오늘 14:32</ThemedText>
              </View>
              <View style={styles.innerDivider} />

              {/* Act 2 */}
              <View style={styles.activityRow}>
                <View style={[styles.dot, { backgroundColor: '#FF9F43' }]} />
                <ThemedText style={styles.activityText}>Step 31 검증 완료 (Titanic)</ThemedText>
                <ThemedText style={styles.activityTime}>어제</ThemedText>
              </View>
              <View style={styles.innerDivider} />

              {/* Act 3 */}
              <View style={styles.activityRow}>
                <View style={[styles.dot, { backgroundColor: '#6C63FF' }]} />
                <ThemedText style={styles.activityText}>에펠탑 Step 8 저장됨</ThemedText>
                <ThemedText style={styles.activityTime}>3일 전</ThemedText>
              </View>
              <View style={styles.innerDivider} />

              {/* Act 4 */}
              <View style={styles.activityRow}>
                <View style={[styles.dot, { backgroundColor: '#8B8FA3' }]} />
                <ThemedText style={styles.activityText}>소방서 세트 스캔 완료</ThemedText>
                <ThemedText style={styles.activityTime}>1주 전</ThemedText>
              </View>

            </View>
          </View>
        )}

        {/* SECTION: APP SETTINGS */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>앱 설정</ThemedText>
          <View style={styles.cardContainer}>
            
            <Pressable style={styles.settingRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FF2E2E' }]}>
                <Ionicons name="notifications" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.settingMeta}>
                <ThemedText style={styles.settingTitle}>알림</ThemedText>
                <ThemedText style={styles.settingSub}>새 업데이트, 완료 축하</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8B8FA3" />
            </Pressable>
            
            <View style={styles.innerDivider} />

            <Pressable style={styles.settingRow}>
              <View style={[styles.iconBox, { backgroundColor: '#6C63FF' }]}>
                <Ionicons name="moon" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.settingMeta}>
                <ThemedText style={styles.settingTitle}>다크 모드</ThemedText>
                <ThemedText style={styles.settingSub}>항상 켜짐</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8B8FA3" />
            </Pressable>

          </View>
        </View>

        {/* SECTION: SECURITY & POLICY */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>계정 및 보안</ThemedText>
          <View style={styles.cardContainer}>
            
            <Pressable style={styles.settingRow}>
              <View style={[styles.iconBox, { backgroundColor: '#10B981' }]}>
                <Ionicons name="shield-checkmark" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.settingMeta}>
                <ThemedText style={styles.settingTitleTextOnly}>개인정보 및 보안</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8B8FA3" />
            </Pressable>
            
            <View style={styles.innerDivider} />

            <Pressable style={styles.settingRow}>
              <View style={[styles.iconBox, { backgroundColor: '#FF9F43' }]}>
                <Ionicons name="help-circle" size={16} color="#FFFFFF" />
              </View>
              <View style={styles.settingMeta}>
                <ThemedText style={styles.settingTitleTextOnly}>도움말 및 지원</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#8B8FA3" />
            </Pressable>

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1017',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 110, // Full padding above tab bar
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
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#161825',
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
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
    borderColor: '#2A2D3E',
    backgroundColor: '#1E2030',
  },
  emptyAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#161825',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FF2E2E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0F1017',
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
    color: '#FFFFFF',
  },
  editBtn: {
    padding: 2,
  },
  subtext: {
    fontSize: 12,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
  },
  masterBadge: {
    backgroundColor: '#FF2E2E20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  masterBadgeText: {
    color: '#FF2E2E',
    fontSize: 10,
    fontWeight: '800',
  },
  levelBadge: {
    backgroundColor: '#FF9F4320',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  levelBadgeText: {
    color: '#FF9F43',
    fontSize: 10,
    fontWeight: '800',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#161825',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
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
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 11,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  dividerCol: {
    width: 1,
    height: 30,
    backgroundColor: '#2A2D3E',
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#8B8FA3',
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
    borderColor: '#2A2D3E',
  },
  projectBg: {
    ...StyleSheet.absoluteFillObject,
  },
  projectOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 16, 23, 0.75)',
  },
  projectContent: {
    gap: 2,
  },
  projectMeta: {
    fontSize: 11,
    color: '#8B8FA3',
    fontWeight: '700',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  projectStep: {
    fontSize: 12,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF2E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContainer: {
    backgroundColor: '#161825',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
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
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activityTime: {
    fontSize: 11,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  innerDivider: {
    height: 1.5,
    backgroundColor: '#2A2D3E',
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
    color: '#FFFFFF',
  },
  settingSub: {
    fontSize: 11,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  settingTitleTextOnly: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    paddingVertical: 4,
  },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161825',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
    padding: 16,
    gap: 12,
    marginTop: 4,
  },
  logoutIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FF2E2E15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FF2E2E',
  },
  footerText: {
    textAlign: 'center',
    fontSize: 11,
    color: '#8B8FA3',
    fontWeight: '600',
    marginTop: 10,
  },
});
