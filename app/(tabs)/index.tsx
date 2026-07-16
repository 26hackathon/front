import { useState, useCallback, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Platform,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { getPosts, togglePostLike, togglePostSave, PostResponse, startPostProgress, endPostProgress } from '@/lib/api';
import { useAppStyles } from '@/hooks/use-app-styles';
import { useProgress } from '@/store/progress-context';

const { width } = Dimensions.get('window');

// We don't need a wrapper state if we trust the API completely, but let's keep it for optimistic updates
interface FeedItemState extends PostResponse {
  isLiked: boolean;
  isBookmarked: boolean;
}

export default function HomeScreen() {
  const router = useRouter();
  const styles = useAppStyles(createStyles);
  const [activeFilter, setActiveFilter] = useState<'all' | 'done' | 'doing' | 'technic' | 'iconic'>('all');
  const [feedItems, setFeedItems] = useState<FeedItemState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { isInProgress, refreshProgress } = useProgress();

  useFocusEffect(
    useCallback(() => {
      fetchPosts(false);
    }, [])
  );

  // Background Auto-Refresh (Polling every 10 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPosts(true); // silent background fetch
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchPosts = async (isSilent: boolean = false) => {
    try {
      if (!isSilent) setIsLoading(true);
      const data = await getPosts();
      
      // Sort by newest first
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setFeedItems(prev => {
        return data.map(post => {
          return {
            ...post,
            isLiked: post.likedByCurrentUser,
            isBookmarked: post.savedByCurrentUser,
          };
        });
      });
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(true);
  }, []);

  const toggleLike = async (id: number) => {
    // Optimistic update
    setFeedItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, isLiked: !item.isLiked, likeCount: item.isLiked ? item.likeCount - 1 : item.likeCount + 1 }
          : item
      )
    );
    try {
      const response = await togglePostLike(id);
      // 백엔드에서 반환해준 정확한 좋아요 수와 상태로 최종 업데이트 (동기화)
      if (response) {
        setFeedItems(prev =>
          prev.map(item =>
            item.id === id
              ? { ...item, isLiked: response.active, likeCount: response.count }
              : item
          )
        );
      }
    } catch (error) {
      console.error('Like failed', error);
      // 에러 발생 시 낙관적 업데이트 롤백
      setFeedItems(prev =>
        prev.map(item =>
          item.id === id
            ? { ...item, isLiked: !item.isLiked, likeCount: item.isLiked ? item.likeCount + 1 : item.likeCount - 1 }
            : item
        )
      );
    }
  };

  const toggleBookmark = async (id: number) => {
    // Optimistic update
    setFeedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked, saveCount: item.isBookmarked ? item.saveCount - 1 : item.saveCount + 1 } : item
      )
    );
    try {
      await togglePostSave(id);
    } catch (error) {
      console.error('Save failed', error);
    }
  };

  const handlePlayStop = async (id: number) => {
    try {
      if (isInProgress(id)) {
        await endPostProgress(id);
      } else {
        await startPostProgress(id);
        router.push('/assembly');
      }
      await refreshProgress();
    } catch (error) {
      console.error('Failed to toggle post progress', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF2E2E" />
        }
      >
        
        {/* TOP BRAND HEADER */}
        <View style={styles.header}>
          <ThemedText style={styles.logoText}>Logo</ThemedText>
          <View style={styles.headerActionIcons}>
            <Pressable style={styles.iconCircle}>
              <Ionicons name="search" size={18} color={styles.defaultIconColor.color} />
            </Pressable>
            <Pressable style={[styles.iconCircle, { backgroundColor: styles.brandIconBg.color }]}>
              <Ionicons name="flame" size={18} color="#FF2E2E" />
            </Pressable>
          </View>
        </View>

        {/* FILTER CHIPS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          {[
            { id: 'all', label: '전체' },
            { id: 'done', label: '완성' },
            { id: 'doing', label: '진행 중' },
            { id: 'technic', label: '테크닉' },
            { id: 'iconic', label: '아이코닉' },
          ].map(tab => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveFilter(tab.id as any)}
              style={[styles.tabChip, activeFilter === tab.id && styles.activeTabChip]}
            >
              <ThemedText style={[styles.tabChipText, activeFilter === tab.id && styles.activeTabChipText]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* SOCIAL FEED — loaded from actual API */}
        <View style={styles.feedContainer}>
          {feedItems.map((item) => (
            <View key={item.id} style={styles.feedCard}>
              {/* User Info Row */}
              <View style={styles.userRow}>
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80' }}
                  style={styles.userAvatar}
                />
                <View style={styles.userInfo}>
                  <ThemedText style={styles.userName}>{item.uploaderNickname || `User ${item.uploaderId}`}</ThemedText>
                  <ThemedText style={styles.timeText}>{new Date(item.createdAt).toLocaleDateString()}</ThemedText>
                </View>
              </View>

              {/* Media Content */}
              <View style={styles.projectWrapper}>
                <Image source={{ uri: item.thumbnailImageUrl }} style={styles.projectBg} />
                <LinearGradient colors={['transparent', 'rgba(15,16,23,0.8)']} style={styles.projectGradient} />
                <View style={styles.projectContent}>
                  <ThemedText style={styles.projectTitle}>{item.title}</ThemedText>
                  <ThemedText style={styles.projectDesc}>
                    {/* 뷰 카운트가 아직 없으면 보여주지 않거나 더미 텍스트 
                        조회수 {item.viewCount}회 */}
                  </ThemedText>
                </View>
                <Pressable
                  style={[styles.playBtn, isInProgress(item.id) && { backgroundColor: '#FF9F43' }]}
                  onPress={() => handlePlayStop(item.id)}
                >
                  <Ionicons name={isInProgress(item.id) ? "stop" : "play"} size={16} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <Pressable style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                  <Ionicons
                    name={item.isLiked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={item.isLiked ? '#FF2E2E' : styles.defaultIconColor.color}
                  />
                  <ThemedText style={{ color: styles.defaultIconColor.color, fontSize: 12, marginLeft: 4 }}>{item.likeCount}</ThemedText>
                </Pressable>
                <Pressable style={[styles.actionBtn, { marginLeft: 8 }]} onPress={() => toggleBookmark(item.id)}>
                  <Ionicons
                    name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={item.isBookmarked ? '#FF9F43' : styles.defaultIconColor.color}
                  />
                  <ThemedText style={{ color: styles.defaultIconColor.color, fontSize: 12, marginLeft: 4 }}>{item.saveCount}</ThemedText>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/create-post')}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </ThemedView>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  defaultIconColor: {
    color: colors.textMuted,
  },
  brandIconBg: {
    color: colors.primary + '20',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerActionIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  tabScrollContainer: {
    gap: 8,
    paddingBottom: 4,
  },
  tabChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.cardSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeTabChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabChipText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '700',
  },
  activeTabChipText: {
    color: '#FFFFFF',
  },
  feedContainer: {
    gap: 20,
    marginTop: 16,
  },
  feedCard: {
    backgroundColor: colors.card,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 16,
    gap: 14,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.text,
  },
  timeText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  projectWrapper: {
    height: 150,
    borderRadius: 18,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'flex-end',
    padding: 16,
  },
  projectBg: {
    ...StyleSheet.absoluteFillObject,
  },
  projectGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  projectContent: {
    gap: 2,
  },
  projectTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  projectDesc: {
    fontSize: 12,
    color: '#FF2E2E',
    fontWeight: '700',
  },
  playBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FF2E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 4,
  },
  actionBtn: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF2E2E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF2E2E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
});
