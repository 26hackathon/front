import { useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Image,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { MOCK_ASSEMBLY_STEPS, AssemblyStep } from '@/data/mockData';

export default function AssemblyScreen() {
  const [steps] = useState<AssemblyStep[]>(MOCK_ASSEMBLY_STEPS);
  const [activeStepIdx, setActiveStepIdx] = useState(3); // Step 4 (0-indexed)
  const [showResumeModal, setShowResumeModal] = useState(true);

  const currentStep = steps[activeStepIdx];

  const handlePrev = () => {
    if (activeStepIdx > 0) setActiveStepIdx(activeStepIdx - 1);
  };

  const handleNext = () => {
    if (activeStepIdx < steps.length - 1) setActiveStepIdx(activeStepIdx + 1);
  };

  const handleResume = () => setShowResumeModal(false);
  const handleGoBack = () => {
    setShowResumeModal(false);
    setActiveStepIdx(0);
  };

  if (!currentStep) return null;

  return (
    <ThemedView style={styles.container}>
      {/* TOP META */}
      <View style={styles.topMeta}>
        <ThemedText style={styles.stepLabel}>
          STEP {String(currentStep.step).padStart(2, '0')} — {currentStep.minutes}분
        </ThemedText>
        <ThemedText style={styles.title}>
          {currentStep.title} - {currentStep.step}
        </ThemedText>
        <View style={styles.progressBarContainer}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${((activeStepIdx + 1) / steps.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* INSTRUCTION DIAGRAM */}
      <View style={styles.diagramContainer}>
        {/* Step tag */}
        <View style={styles.stepTag}>
          <ThemedText style={styles.stepTagText}>Step {String(currentStep.step).padStart(2, '0')}</ThemedText>
        </View>
        {/* Zoom controls */}
        <View style={styles.zoomControls}>
          <Pressable style={styles.zoomBtn}>
            <Ionicons name="remove" size={16} color="#333" />
          </Pressable>
          <Pressable style={styles.zoomBtn}>
            <Ionicons name="add" size={16} color="#333" />
          </Pressable>
        </View>
        {/* Instruction image from mock data */}
        <Image
          source={{ uri: currentStep.image }}
          style={styles.instructionImage}
          resizeMode="contain"
        />
      </View>

      {/* NAV ROW */}
      <View style={styles.navRow}>
        <Pressable
          onPress={handlePrev}
          disabled={activeStepIdx === 0}
          style={({ pressed }) => [
            styles.prevBtn,
            { opacity: activeStepIdx === 0 ? 0.3 : pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.nextBtn,
            { backgroundColor: pressed ? '#A01818' : '#CC2222' }
          ]}
        >
          <ThemedText style={styles.nextBtnText}>다음 단계</ThemedText>
          <ThemedText style={styles.nextBtnArrow}> {'>'}</ThemedText>
        </Pressable>
      </View>

      {/* RESUME MODAL */}
      <Modal
        visible={showResumeModal}
        transparent
        animationType="fade"
        statusBarTranslucent
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <ThemedText style={styles.modalTitle}>이전에 조립하던 이력이 있어요.</ThemedText>
            <ThemedText style={styles.modalSubtitle}>이어하시겠습니까?</ThemedText>
            <Pressable
              style={({ pressed }) => [styles.modalBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={handleResume}
            >
              <ThemedText style={styles.modalBtnText}>이어하기</ThemedText>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.modalBtn, { opacity: pressed ? 0.7 : 1 }]}
              onPress={handleGoBack}
            >
              <ThemedText style={styles.modalBtnTextRed}>뒤로가기</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F1017',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
  },
  topMeta: {
    gap: 4,
    marginTop: 10,
    marginBottom: 16,
  },
  stepLabel: {
    fontSize: 13,
    color: '#FF2E2E',
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  progressBarContainer: {
    height: 3,
    backgroundColor: '#2A2D3E',
    borderRadius: 2,
    marginTop: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF2E2E',
    borderRadius: 2,
  },
  diagramContainer: {
    flex: 1,
    backgroundColor: '#DDDDDD',
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepTag: {
    position: 'absolute',
    top: 14,
    left: 14,
    backgroundColor: '#FF9F43',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    zIndex: 10,
  },
  stepTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  zoomControls: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    gap: 6,
    zIndex: 10,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFFCC',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  instructionImage: {
    width: '85%',
    height: '70%',
  },
  navRow: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
  },
  prevBtn: {
    width: 54,
    height: 54,
    borderRadius: 14,
    backgroundColor: '#1E2030',
    borderWidth: 1,
    borderColor: '#2A2D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    flex: 1,
    height: 54,
    borderRadius: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  nextBtnArrow: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    gap: 8,
    width: '100%',
    maxWidth: 320,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#11181C',
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalBtn: {
    width: '100%',
    height: 52,
    backgroundColor: '#F0F0F0',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBtnText: {
    color: '#11181C',
    fontSize: 16,
    fontWeight: '600',
  },
  modalBtnTextRed: {
    color: '#FF2E2E',
    fontSize: 16,
    fontWeight: '600',
  },
});
