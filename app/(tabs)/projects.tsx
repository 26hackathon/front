import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Image,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from 'react-native';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

export default function ProjectsScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState<'all' | 'doing' | 'assembling' | 'done'>('all');

  const projects = [
    {
      title: 'Titanic',
      info: 'Creator Expert 10294',
      status: 'Step 31/48 • 9,090피스',
      time: '어제',
      progress: 0.65,
      isDone: false,
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Ferrari Daytona SP3',
      info: 'Technic 42143',
      status: '완성 • 3,778피스',
      time: '3일 전',
      progress: 1.0,
      isDone: true,
      image: 'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Eiffel Tower',
      info: 'Icons 10307',
      status: 'Step 8/60 • 10,001피스',
      time: '1주 전',
      progress: 0.13,
      isDone: false,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Eiffel Tower',
      info: 'Icons 10307',
      status: 'Step 8/60 • 10,001피스',
      time: '1주 전',
      progress: 0.13,
      isDone: false,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'Eiffel Tower',
      info: 'Icons 10307',
      status: 'Step 8/60 • 10,001피스',
      time: '1주 전',
      progress: 0.13,
      isDone: false,
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=400&q=80',
    }
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER SECTION */}
        <View style={styles.headerRow}>
          <ThemedText style={styles.headerTitle}>내 프로젝트</ThemedText>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconCircle}>
              <Ionicons name="grid" size={16} color="#8B8FA3" />
            </Pressable>
            <Pressable
              onPress={() => router.push({ pathname: '/scan', params: { entry: 'project-create' } })}
              style={[styles.iconCircle, { backgroundColor: '#FF5C5C' }]}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* FILTER CHIPS */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: '전체 3' },
            { id: 'doing', label: '진행 중 2' },
            { id: 'assembling', label: '조립중 1' },
            { id: 'done', label: '완성 1' }
          ].map(chip => (
            <Pressable
              key={chip.id}
              onPress={() => setActiveFilter(chip.id as any)}
              style={[
                styles.filterChip,
                activeFilter === chip.id && styles.activeFilterChip
              ]}
            >
              <ThemedText style={[
                styles.filterChipText,
                activeFilter === chip.id && styles.activeFilterChipText
              ]}>
                {chip.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* CONTINUE ASSEMBLING PROMO CARD */}
        <View style={styles.promoCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80' }}
            style={styles.promoBg}
          />
          <View style={styles.promoOverlay} />
          <View style={styles.promoContent}>
            <View style={styles.promoTagRow}>
              <View style={styles.redDot} />
              <ThemedText style={styles.promoTag}>이어서 조립하기</ThemedText>
            </View>
            <ThemedText style={styles.promoTitle}>Titanic</ThemedText>
            <ThemedText style={styles.promoStep}>Step 31 진행 중</ThemedText>
          </View>
          <Pressable style={styles.promoPlayBtn}>
            <Ionicons name="play" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* SINGLE ENCLOSING PROJECTS CONTAINER */}
        <View style={styles.projectsContainer}>
          {projects.map((proj, idx) => (
            <View key={idx} style={styles.projectWrapper}>
              
              {/* Main item row */}
              <View style={styles.projectItemRow}>
                <Image source={{ uri: proj.image }} style={styles.projectImage} />
                
                <View style={styles.projectDetail}>
                  <ThemedText style={styles.projectMetaInfo}>{proj.info}</ThemedText>
                  
                  <View style={styles.titleRow}>
                    <ThemedText style={styles.projectTitle}>{proj.title}</ThemedText>
                    <Pressable style={styles.moreBtn}>
                      <Ionicons name="ellipsis-horizontal" size={16} color="#8B8FA3" />
                    </Pressable>
                  </View>

                  {/* Progress Line */}
                  <View style={styles.progressContainer}>
                    <View style={[
                      styles.progressBar,
                      {
                        width: `${proj.progress * 100}%`,
                        backgroundColor: proj.isDone ? '#39D353' : '#FF2E2E'
                      }
                    ]} />
                  </View>

                  {/* Status metadata and clock */}
                  <View style={styles.statusRow}>
                    <ThemedText style={styles.statusText}>{proj.status}</ThemedText>
                    <View style={styles.timeWrapper}>
                      <Ionicons name="time-outline" size={13} color="#8B8FA3" />
                      <ThemedText style={styles.timeText}>{proj.time}</ThemedText>
                    </View>
                  </View>

                </View>
              </View>

              {/* Separator Divider */}
              {idx < projects.length - 1 && <View style={styles.divider} />}
              
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
  headerRight: {
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
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1E2030',
    borderWidth: 1,
    borderColor: '#2A2D3E',
  },
  activeFilterChip: {
    backgroundColor: '#FF2E2E',
    borderColor: '#FF2E2E',
  },
  filterChipText: {
    fontSize: 13,
    color: '#8B8FA3',
    fontWeight: '700',
  },
  activeFilterChipText: {
    color: '#FFFFFF',
  },
  promoCard: {
    height: 120,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
  },
  promoBg: {
    ...StyleSheet.absoluteFillObject,
  },
  promoOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 16, 23, 0.7)',
  },
  promoContent: {
    gap: 4,
  },
  promoTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  redDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF2E2E',
  },
  promoTag: {
    fontSize: 12,
    color: '#8B8FA3',
    fontWeight: '700',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  promoStep: {
    fontSize: 13,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  promoPlayBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF2E2E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  projectsContainer: {
    backgroundColor: '#161825',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
    padding: 16,
  },
  projectWrapper: {
    gap: 16,
  },
  projectItemRow: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 4,
  },
  projectImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#2A2D3E',
  },
  projectDetail: {
    flex: 1,
    gap: 4,
  },
  projectMetaInfo: {
    fontSize: 11,
    color: '#8B8FA3',
    fontWeight: '700',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  moreBtn: {
    padding: 4,
  },
  progressContainer: {
    height: 3,
    backgroundColor: '#0F1017',
    borderRadius: 1.5,
    marginVertical: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 1.5,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#8B8FA3',
    fontWeight: '600',
  },
  divider: {
    height: 1.5,
    backgroundColor: '#2A2D3E',
    marginVertical: 12,
  },
});
