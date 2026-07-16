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

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { MOCK_PROJECTS, MOCK_ACTIVE_PROJECT, Project } from '@/data/mockData';

export default function ProjectsScreen() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'doing' | 'assembling' | 'done'>('all');
  const [projects] = useState<Project[]>(MOCK_PROJECTS);

  const filteredProjects = projects.filter(proj => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'done') return proj.isDone;
    if (activeFilter === 'doing') return !proj.isDone && proj.progress < 1;
    if (activeFilter === 'assembling') return !proj.isDone && proj.progress > 0 && proj.progress < 0.5;
    return true;
  });

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.headerRow}>
          <ThemedText style={styles.headerTitle}>내 프로젝트</ThemedText>
          <View style={styles.headerRight}>
            <Pressable style={styles.iconCircle}>
              <Ionicons name="grid" size={16} color="#8B8FA3" />
            </Pressable>
            <Pressable style={[styles.iconCircle, { backgroundColor: '#FF5C5C' }]}>
              <Ionicons name="add" size={20} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* FILTER CHIPS */}
        <View style={styles.filterRow}>
          {[
            { id: 'all', label: `전체 ${projects.length}` },
            { id: 'doing', label: `진행 중 ${projects.filter(p => !p.isDone).length}` },
            { id: 'assembling', label: '조립중 1' },
            { id: 'done', label: `완성 ${projects.filter(p => p.isDone).length}` },
          ].map(chip => (
            <Pressable
              key={chip.id}
              onPress={() => setActiveFilter(chip.id as any)}
              style={[styles.filterChip, activeFilter === chip.id && styles.activeFilterChip]}
            >
              <ThemedText style={[styles.filterChipText, activeFilter === chip.id && styles.activeFilterChipText]}>
                {chip.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        {/* CONTINUE ASSEMBLING PROMO — from MOCK_ACTIVE_PROJECT */}
        <View style={styles.promoCard}>
          <Image source={{ uri: MOCK_ACTIVE_PROJECT.image }} style={styles.promoBg} />
          <View style={styles.promoOverlay} />
          <View style={styles.promoContent}>
            <View style={styles.promoTagRow}>
              <View style={styles.redDot} />
              <ThemedText style={styles.promoTag}>이어서 조립하기</ThemedText>
            </View>
            <ThemedText style={styles.promoTitle}>{MOCK_ACTIVE_PROJECT.title}</ThemedText>
            <ThemedText style={styles.promoStep}>{MOCK_ACTIVE_PROJECT.status}</ThemedText>
          </View>
          <Pressable style={styles.promoPlayBtn}>
            <Ionicons name="play" size={18} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* PROJECTS LIST — loaded from filteredProjects */}
        <View style={styles.projectsContainer}>
          {filteredProjects.map((proj, idx) => (
            <View key={proj.id} style={styles.projectWrapper}>
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
                  <View style={styles.progressContainer}>
                    <View style={[
                      styles.progressBar,
                      { width: `${proj.progress * 100}%`, backgroundColor: proj.isDone ? '#39D353' : '#FF2E2E' }
                    ]} />
                  </View>
                  <View style={styles.statusRow}>
                    <ThemedText style={styles.statusText}>{proj.status}</ThemedText>
                    <View style={styles.timeWrapper}>
                      <Ionicons name="time-outline" size={13} color="#8B8FA3" />
                      <ThemedText style={styles.timeText}>{proj.time}</ThemedText>
                    </View>
                  </View>
                </View>
              </View>
              {idx < filteredProjects.length - 1 && <View style={styles.divider} />}
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
