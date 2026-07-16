import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { MOCK_FEED, MOCK_HERO, FeedItem } from '@/data/mockData';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'done' | 'doing' | 'technic' | 'iconic'>('all');
  const [feedItems, setFeedItems] = useState<FeedItem[]>(MOCK_FEED);

  const toggleLike = (id: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === id
          ? { ...item, isLiked: !item.isLiked, likes: item.isLiked ? item.likes - 1 : item.likes + 1 }
          : item
      )
    );
  };

  const toggleBookmark = (id: string) => {
    setFeedItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, isBookmarked: !item.isBookmarked } : item
      )
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP BRAND HEADER */}
        <View style={styles.header}>
          <ThemedText style={styles.logoText}>Logo</ThemedText>
          <View style={styles.headerActionIcons}>
            <Pressable style={styles.iconCircle}>
              <Ionicons name="search" size={18} color="#8B8FA3" />
            </Pressable>
            <Pressable style={[styles.iconCircle, { backgroundColor: '#FF2E2E20' }]}>
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

        {/* HERO BANNER */}
        <View style={styles.heroCard}>
          <Image source={{ uri: MOCK_HERO.image }} style={styles.heroImage} />
          <LinearGradient colors={['transparent', 'rgba(15, 16, 23, 0.95)']} style={styles.heroGradient} />
          <View style={styles.heroMeta}>
            <View style={styles.bannerBadge}>
              <ThemedText style={styles.bannerBadgeText}>{MOCK_HERO.badgeText}</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>{MOCK_HERO.title}</ThemedText>
            <View style={styles.likeRow}>
              <Ionicons name="heart" size={14} color="#FF2E2E" />
              <ThemedText style={styles.likeText}>{MOCK_HERO.likes.toLocaleString()}</ThemedText>
              <ThemedText style={styles.pcsText}>• {MOCK_HERO.pcs.toLocaleString()}피스 - {MOCK_HERO.pct}%</ThemedText>
            </View>
          </View>
        </View>

        {/* SOCIAL FEED — loaded from MOCK_FEED */}
        <View style={styles.feedContainer}>
          {feedItems.map((item) => (
            <View key={item.id} style={styles.feedCard}>
              {/* User row */}
              <View style={styles.userRow}>
                <Image source={{ uri: item.userAvatar }} style={styles.userAvatar} />
                <View style={styles.userInfo}>
                  <ThemedText style={styles.userName}>{item.userName}</ThemedText>
                  <ThemedText style={styles.timeText}>{item.timeAgo}</ThemedText>
                </View>
              </View>

              {/* Project card */}
              <View style={styles.projectWrapper}>
                <Image source={{ uri: item.projectImage }} style={styles.projectBg} />
                <LinearGradient
                  colors={['transparent', 'rgba(15, 16, 23, 0.8)']}
                  style={styles.projectGradient}
                />
                <View style={styles.projectContent}>
                  <ThemedText style={styles.projectTitle}>{item.projectTitle}</ThemedText>
                  <ThemedText style={styles.projectDesc}>{item.projectDesc}</ThemedText>
                </View>
                <Pressable style={styles.playBtn}>
                  <Ionicons name="play" size={16} color="#FFFFFF" />
                </Pressable>
              </View>

              {/* Actions */}
              <View style={styles.actionRow}>
                <Pressable style={styles.actionBtn} onPress={() => toggleLike(item.id)}>
                  <Ionicons
                    name={item.isLiked ? 'heart' : 'heart-outline'}
                    size={22}
                    color={item.isLiked ? '#FF2E2E' : '#8B8FA3'}
                  />
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => toggleBookmark(item.id)}>
                  <Ionicons
                    name={item.isBookmarked ? 'bookmark' : 'bookmark-outline'}
                    size={20}
                    color={item.isBookmarked ? '#FF9F43' : '#8B8FA3'}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>

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
    color: '#FFFFFF',
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
    backgroundColor: '#161825',
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
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
    backgroundColor: '#1E2030',
    borderWidth: 1,
    borderColor: '#2A2D3E',
  },
  activeTabChip: {
    backgroundColor: '#FF2E2E',
    borderColor: '#FF2E2E',
  },
  tabChipText: {
    fontSize: 13,
    color: '#8B8FA3',
    fontWeight: '700',
  },
  activeTabChipText: {
    color: '#FFFFFF',
  },
  heroCard: {
    height: 220,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '60%',
  },
  heroMeta: {
    position: 'absolute',
    bottom: 16,
    left: 20,
    right: 20,
    gap: 4,
  },
  bannerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF9F43',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 4,
  },
  bannerBadgeText: {
    color: '#0F1017',
    fontSize: 11,
    fontWeight: '800',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  likeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  likeText: {
    color: '#FF2E2E',
    fontSize: 12,
    fontWeight: '800',
  },
  pcsText: {
    color: '#8B8FA3',
    fontSize: 12,
    fontWeight: '600',
  },
  feedContainer: {
    gap: 20,
  },
  feedCard: {
    backgroundColor: '#161825',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
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
    borderColor: '#2A2D3E',
  },
  userInfo: {
    gap: 2,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  timeText: {
    fontSize: 11,
    color: '#8B8FA3',
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
});
