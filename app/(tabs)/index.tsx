import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

const { width } = Dimensions.get('window');

// LDraw Coordinate Calculator Helper
function calculateLduCoords(stepIdx: number, brickId: string) {
  const studInterval = 20;
  const standardHeight = 24;
  const x = stepIdx * 2 * studInterval;
  const y = stepIdx * standardHeight;
  const z = 0;
  return { x, y, z };
}

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const [assemblySteps, setAssemblySteps] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'done' | 'doing' | 'technic' | 'iconic'>('all');
  const [showAiEngine, setShowAiEngine] = useState(false);

  const handleGenerate = () => {
    if (!inputText.trim()) return;
    setIsGenerating(true);
    
    setTimeout(() => {
      const parsedSteps = [
        {
          step_number: 1,
          brick_id: '3001',
          color_code: 1,
          description: '파란색 2x4 규격 브릭을 바닥판 기준 원점에 배치합니다.',
          install_position: calculateLduCoords(0, '3001'),
          rotation: { x: 0, y: 0, z: 0 },
          connection_info: {
            target_brick_step: null,
            stud_coordinates: [],
            hole_coordinates: []
          }
        },
        {
          step_number: 2,
          brick_id: '3003',
          color_code: 14,
          description: '노란색 2x2 규격 브릭을 파란색 브릭의 우측 돌기 4칸 영역에 결합합니다.',
          install_position: calculateLduCoords(1, '3003'),
          rotation: { x: 0, y: 0, z: 0 },
          connection_info: {
            target_brick_step: 1,
            stud_coordinates: [{ x: 2, z: 0 }, { x: 3, z: 0 }],
            hole_coordinates: [{ x: 0, z: 0 }, { x: 1, z: 0 }]
          }
        }
      ];
      setAssemblySteps(parsedSteps);
      setIsGenerating(false);
    }, 1200);
  };

  const getStepText = (steps: typeof assemblySteps) => {
    return JSON.stringify({ assembly_steps: steps }, null, 2);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP BRAND HEADER MATCHING MOCKUP */}
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

        {/* HORIZONTAL FILTERS MATCHING MOCKUP */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          {[
            { id: 'all', label: '전체' },
            { id: 'done', label: '완성' },
            { id: 'doing', label: '진행 중' },
            { id: 'technic', label: '테크닉' },
            { id: 'iconic', label: '아이코닉' }
          ].map(tab => (
            <Pressable
              key={tab.id}
              onPress={() => setActiveFilter(tab.id as any)}
              style={[
                styles.tabChip,
                activeFilter === tab.id && styles.activeTabChip
              ]}
            >
              <ThemedText style={[
                styles.tabChipText,
                activeFilter === tab.id && styles.activeTabChipText
              ]}>
                {tab.label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {/* HERO BANNER CARD MATCHING MOCKUP */}
        <View style={styles.heroCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1585366119957-e5733f3998bf?auto=format&fit=crop&w=800&q=80' }}
            style={styles.heroImage}
          />
          <LinearGradient
            colors={['transparent', 'rgba(15, 16, 23, 0.95)']}
            style={styles.heroGradient}
          />
          <View style={styles.heroMeta}>
            <View style={styles.bannerBadge}>
              <ThemedText style={styles.bannerBadgeText}>오 이번 주 1위</ThemedText>
            </View>
            <ThemedText style={styles.heroTitle}>고O윤</ThemedText>
            <View style={styles.likeRow}>
              <Ionicons name="heart" size={14} color="#FF2E2E" />
              <ThemedText style={styles.likeText}>5,204</ThemedText>
              <ThemedText style={styles.pcsText}>• 7,541피스 - 99.4%</ThemedText>
            </View>
          </View>
        </View>

        {/* HEADER SECTION FOR ACTION ITEMS */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>추천 창작 피드</ThemedText>
          <Pressable
            onPress={() => setShowAiEngine(!showAiEngine)}
            style={[styles.aiToggleBtn, showAiEngine && styles.aiToggleBtnActive]}
          >
            <Ionicons name="construct" size={15} color={showAiEngine ? '#FFFFFF' : '#FF2E2E'} />
            <ThemedText style={[styles.aiToggleText, showAiEngine && styles.aiToggleTextActive]}>
              {showAiEngine ? '피드 보기' : 'AI 역설계 엔진'}
            </ThemedText>
          </Pressable>
        </View>

        {/* AI INFERENCE ENGINE CONTROLLER (SHOWN CONDITIONALLY) */}
        {showAiEngine ? (
          <View style={styles.card}>
            <ThemedText style={styles.cardTitle}>⚙️ GGÆDA AI 비전 역설계 엔진</ThemedText>
            <ThemedText style={styles.cardDesc}>
              레고 조립 묘사문을 통해 LDraw 규격의 수평(20 LDU) 및 수직(24/8 LDU) 조립 좌표 데이터를 추출합니다.
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="예: 파란색 2x4 브릭 위에 노란색 2x2 브릭을 결합해줘..."
                placeholderTextColor="#8B8FA3"
                value={inputText}
                onChangeText={setInputText}
                multiline
              />
            </View>

            <Pressable
              onPress={handleGenerate}
              disabled={isGenerating}
              style={({ pressed }) => [
                styles.generateBtn,
                { backgroundColor: pressed ? '#D02E2E' : '#FF2E2E' }
              ]}
            >
              <Ionicons name="cube" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
              <ThemedText style={styles.generateBtnText}>
                {isGenerating ? 'LDraw 좌표 역설계 중...' : '3D 조립 좌표 추출'}
              </ThemedText>
            </Pressable>

            {assemblySteps.length > 0 && (
              <View style={styles.codeWrapper}>
                <View style={styles.outputHeader}>
                  <ThemedText style={styles.codeTitle}>역설계된 LDraw JSON</ThemedText>
                </View>
                <View style={styles.codeBlock}>
                  <ScrollView horizontal>
                    <ThemedText style={styles.codeText}>
                      {getStepText(assemblySteps)}
                    </ThemedText>
                  </ScrollView>
                </View>
              </View>
            )}
          </View>
        ) : (
          /* SOCIAL FEED LIST MATCHING MOCKUP */
          <View style={styles.feedContainer}>
            {[1, 2, 3].map((item) => (
              <View key={item} style={styles.feedCard}>
                
                {/* User profile row */}
                <View style={styles.userRow}>
                  <Image
                    source={{ uri: `https://randomuser.me/api/portraits/lego/${item}.jpg` }}
                    style={styles.userAvatar}
                  />
                  <View style={styles.userInfo}>
                    <ThemedText style={styles.userName}>MyNameIsYoonKo</ThemedText>
                    <ThemedText style={styles.timeText}>about 1 hours</ThemedText>
                  </View>
                </View>

                {/* Big project card with play button */}
                <View style={styles.projectWrapper}>
                  <Image
                    source={{ uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&q=80' }}
                    style={styles.projectBg}
                  />
                  <LinearGradient
                    colors={['transparent', 'rgba(15, 16, 23, 0.8)']}
                    style={styles.projectGradient}
                  />
                  <View style={styles.projectContent}>
                    <ThemedText style={styles.projectTitle}>Titanic</ThemedText>
                    <ThemedText style={styles.projectDesc}>360 pcs</ThemedText>
                  </View>
                  <Pressable style={styles.playBtn}>
                    <Ionicons name="play" size={16} color="#FFFFFF" />
                  </Pressable>
                </View>

                {/* Feed actions bottom (heart, bookmark) */}
                <View style={styles.actionRow}>
                  <Pressable style={styles.actionBtn}>
                    <Ionicons name="heart-outline" size={22} color="#8B8FA3" />
                  </Pressable>
                  <Pressable style={styles.actionBtn}>
                    <Ionicons name="bookmark-outline" size={20} color="#8B8FA3" />
                  </Pressable>
                </View>

              </View>
            ))}
          </View>
        )}

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
    paddingBottom: 110, // Added padding to scroll fully above the absolute floating tab bar
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  aiToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#FF2E2E15',
    borderWidth: 1,
    borderColor: '#FF2E2E40',
  },
  aiToggleBtnActive: {
    backgroundColor: '#FF2E2E',
    borderColor: '#FF2E2E',
  },
  aiToggleText: {
    fontSize: 12,
    color: '#FF2E2E',
    fontWeight: '700',
  },
  aiToggleTextActive: {
    color: '#FFFFFF',
  },
  card: {
    backgroundColor: '#161825',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
    padding: 20,
    gap: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cardDesc: {
    fontSize: 13,
    color: '#8B8FA3',
    lineHeight: 18,
  },
  inputContainer: {
    borderRadius: 16,
    backgroundColor: '#0F1017',
    borderWidth: 1.5,
    borderColor: '#2A2D3E',
    height: 90,
    padding: 12,
  },
  textInput: {
    flex: 1,
    color: '#ECEDEE',
    fontSize: 14,
    textAlignVertical: 'top',
  },
  generateBtn: {
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  codeWrapper: {
    gap: 10,
  },
  outputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  codeBlock: {
    backgroundColor: '#0F1017',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#2A2D3E',
  },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#FF2E2E',
    fontSize: 11,
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
