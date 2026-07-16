import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Image, Platform, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import BrickViewer from '@/components/brick-viewer';
import { ThemedText } from '@/components/ui/themed-text';
import { MOCK_ASSEMBLY_STEPS } from '@/data/mockData';
import { BrickData } from '@/types';

const ASSEMBLY_BRICKS: BrickData[] = [
  { brickId: '3020', colorCode: '7', position: { x: 0, y: 0, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  { brickId: '3023', colorCode: '4', position: { x: -0.5, y: 0.4, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
  { brickId: '3023', colorCode: '4', position: { x: 0.5, y: 0.4, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
  { brickId: '3022', colorCode: '6', position: { x: 0, y: 0.8, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  { brickId: '3023', colorCode: '4', position: { x: 0, y: 1.2, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
  { brickId: '3710', colorCode: '7', position: { x: 0, y: 1.6, z: 0 }, rotation: { x: 0, y: 90, z: 0 } },
  { brickId: '3024', colorCode: '4', position: { x: 0, y: 2, z: 0 }, rotation: { x: 0, y: 0, z: 0 } },
];

const ASSEMBLY_PROGRESS_KEY = 'assembly-progress-step';

async function readSavedStep(): Promise<number | null> {
  const value = Platform.OS === 'web'
    ? globalThis.localStorage?.getItem(ASSEMBLY_PROGRESS_KEY)
    : await SecureStore.getItemAsync(ASSEMBLY_PROGRESS_KEY);
  if (value === null || value === undefined) return null;

  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
}

async function saveStep(stepIndex: number) {
  const value = String(stepIndex);
  if (Platform.OS === 'web') {
    globalThis.localStorage?.setItem(ASSEMBLY_PROGRESS_KEY, value);
    return;
  }
  await SecureStore.setItemAsync(ASSEMBLY_PROGRESS_KEY, value);
}

export default function AssemblyScreen() {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const currentStep = MOCK_ASSEMBLY_STEPS[activeStepIdx];
  const visibleBricks = useMemo(
    () => ASSEMBLY_BRICKS.slice(0, activeStepIdx + 1),
    [activeStepIdx]
  );

  useEffect(() => {
    let isMounted = true;

    const restoreProgress = async () => {
      try {
        const savedStepIdx = await readSavedStep();
        if (!isMounted) return;

        const hasInProgressAssembly =
          savedStepIdx !== null &&
          savedStepIdx > 0 &&
          savedStepIdx < MOCK_ASSEMBLY_STEPS.length;

        if (!hasInProgressAssembly) {
          setHasLoadedProgress(true);
          return;
        }

        Alert.alert(
          '진행 중인 조립이 있어요',
          `${savedStepIdx + 1}단계부터 이어서 진행하시겠어요?`,
          [
            {
              text: '처음부터',
              style: 'destructive',
              onPress: () => {
                setActiveStepIdx(0);
                setHasLoadedProgress(true);
                void saveStep(0);
              },
            },
            {
              text: '이어서 진행',
              onPress: () => {
                setActiveStepIdx(savedStepIdx);
                setHasLoadedProgress(true);
              },
            },
          ],
          { cancelable: false }
        );
      } catch (error) {
        console.warn('조립 진행도를 불러오지 못했습니다.', error);
        if (isMounted) setHasLoadedProgress(true);
      }
    };

    void restoreProgress();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasLoadedProgress) return;
    void saveStep(activeStepIdx).catch(error => {
      console.warn('조립 진행도를 저장하지 못했습니다.', error);
    });
  }, [activeStepIdx, hasLoadedProgress]);

  const handlePrev = () => setActiveStepIdx(index => Math.max(0, index - 1));
  const handleNext = () =>
    setActiveStepIdx(index => Math.min(MOCK_ASSEMBLY_STEPS.length - 1, index + 1));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>
            {currentStep.title} - {currentStep.step}
          </ThemedText>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((activeStepIdx + 1) / MOCK_ASSEMBLY_STEPS.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.previewCard}>
          <Image source={{ uri: currentStep.image }} style={styles.previewImage} resizeMode="cover" />
          <View style={styles.previewShade} />
          <View style={styles.previewCopy}>
            <ThemedText style={styles.previewEyebrow}>완성 미리보기</ThemedText>
            <ThemedText style={styles.previewTitle}>계단 모듈</ThemedText>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <BrickViewer bricks={visibleBricks} />
          <View style={styles.stepBadge}>
            <ThemedText style={styles.stepBadgeText}>
              Step {String(currentStep.step).padStart(2, '0')}
            </ThemedText>
          </View>
          <View style={styles.modelCaption} pointerEvents="none">
            <ThemedText style={styles.modelCaptionIndex}>{currentStep.step}</ThemedText>
            <ThemedText style={styles.modelCaptionText}>표시된 브릭을 결합하세요</ThemedText>
          </View>
        </View>

        <View style={styles.navigation}>
          <Pressable
            accessibilityLabel="이전 단계"
            disabled={activeStepIdx === 0}
            onPress={handlePrev}
            style={({ pressed }) => [
              styles.previousButton,
              activeStepIdx === 0 && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Ionicons name="chevron-back" size={23} color="#FFFFFF" />
          </Pressable>

          <Pressable
            accessibilityLabel="다음 단계"
            disabled={activeStepIdx === MOCK_ASSEMBLY_STEPS.length - 1}
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextButton,
              activeStepIdx === MOCK_ASSEMBLY_STEPS.length - 1 && styles.disabledButton,
              pressed && styles.pressedButton,
            ]}
          >
            <ThemedText style={styles.nextButtonText}>
              {activeStepIdx === MOCK_ASSEMBLY_STEPS.length - 1 ? '조립 완료' : '다음 단계'}
            </ThemedText>
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#111217',
  },
  container: {
    flex: 1,
    backgroundColor: '#111217',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 16 : 12,
    paddingBottom: 14,
    gap: 12,
  },
  header: {
    gap: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '900',
    letterSpacing: -0.6,
  },
  progressTrack: {
    height: 4,
    overflow: 'hidden',
    borderRadius: 2,
    backgroundColor: '#4B4D54',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: '#E21B22',
  },
  previewCard: {
    height: 98,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#262832',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(10, 11, 16, 0.28)',
  },
  previewCopy: {
    position: 'absolute',
    left: 14,
    bottom: 12,
  },
  previewEyebrow: {
    color: '#E7E8EC',
    fontSize: 10,
    fontWeight: '700',
  },
  previewTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  instructionCard: {
    flex: 1,
    minHeight: 280,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#BFD5E9',
    backgroundColor: '#D9ECFF',
  },
  stepBadge: {
    position: 'absolute',
    top: 13,
    left: 13,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#15171C',
  },
  stepBadgeText: {
    color: '#FFE900',
    fontSize: 12,
    fontWeight: '900',
  },
  modelCaption: {
    position: 'absolute',
    left: 18,
    right: 18,
    bottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  modelCaptionIndex: {
    color: '#121319',
    fontSize: 28,
    fontWeight: '900',
  },
  modelCaptionText: {
    color: '#313743',
    fontSize: 12,
    fontWeight: '700',
  },
  navigation: {
    height: 54,
    flexDirection: 'row',
    gap: 12,
  },
  previousButton: {
    width: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#464954',
    backgroundColor: '#292C35',
  },
  nextButton: {
    flex: 1,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#D71920',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
  },
  disabledButton: {
    opacity: 0.38,
  },
  pressedButton: {
    opacity: 0.72,
  },
});
