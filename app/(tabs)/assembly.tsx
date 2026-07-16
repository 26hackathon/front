import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';
import { Assembly3DViewer } from '@/features/assembly/components/assembly-3d-viewer';

export default function AssemblyScreen() {
  const [activeStep, setActiveStep] = useState(4);
  const [zoomLevel, setZoomLevel] = useState(1);

  const handlePrev = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleNext = () => {
    if (activeStep < 7) setActiveStep(activeStep + 1);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* TOP META ROW */}
        <View style={styles.metaRow}>
          <View style={styles.badge}>
            <ThemedText style={styles.badgeText}>STEP 0{activeStep} — 3분</ThemedText>
          </View>
          <ThemedText style={styles.title}>머리 조립</ThemedText>
        </View>

        {/* INSTRUCTION DIAGRAM BOX */}
        <View style={styles.diagramContainer}>
          
          {/* Zoom controls */}
          <View style={styles.zoomControls}>
            <Pressable onPress={() => setZoomLevel(1)} style={styles.zoomBtn}>
              <Ionicons name="search-outline" size={16} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => setZoomLevel((current) => Math.min(1.75, current + 0.15))}
              style={styles.zoomBtn}
            >
              <Ionicons name="add-outline" size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Current Step Overlay Tag */}
          <View style={styles.stepTag}>
            <ThemedText style={styles.stepTagText}>Step 0{activeStep}</ThemedText>
          </View>

          <Assembly3DViewer step={activeStep} zoomLevel={zoomLevel} style={styles.viewer} />

          {/* Assembly direction indicators */}
          <View style={styles.guideContainer}>
            <Ionicons name="arrow-down" size={32} color="#FF5C5C" />
            <ThemedText style={styles.guideText}>LDraw 기준으로 브릭이 쌓입니다</ThemedText>
          </View>
        </View>

        {/* PREV/NEXT NAVIGATION ROW */}
        <View style={styles.navRow}>
          <Pressable
            onPress={handlePrev}
            style={({ pressed }) => [
              styles.navBtnCircle,
              { opacity: activeStep === 1 ? 0.3 : (pressed ? 0.7 : 1) }
            ]}
            disabled={activeStep === 1}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.nextBtn,
              { backgroundColor: pressed ? '#E04B4B' : '#FF5C5C' }
            ]}
          >
            <ThemedText style={styles.nextBtnText}>다음 단계</ThemedText>
            <Ionicons name="chevron-forward" size={18} color="#FFFFFF" style={{ marginLeft: 6 }} />
          </Pressable>
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
    paddingTop: 60,
    paddingBottom: 110,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 600,
    gap: 24,
  },
  metaRow: {
    gap: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FF5C5C20',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FF5C5C',
    fontSize: 11,
    fontWeight: '700',
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  diagramContainer: {
    height: 420,
    borderRadius: 24,
    backgroundColor: '#FFFFFF', // Clean light gray/white diagram card matching mockup
    borderWidth: 1.5,
    borderColor: '#FF5C5C', // Bright highlight border matching chanhyuk indicator
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  zoomControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    gap: 8,
    zIndex: 10,
  },
  zoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(15, 16, 23, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepTag: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FF9F43',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    zIndex: 10,
  },
  stepTagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  viewer: {
    width: '100%',
    height: '100%',
  },
  guideContainer: {
    position: 'absolute',
    bottom: 24,
    alignItems: 'center',
    gap: 4,
  },
  guideText: {
    fontSize: 13,
    color: '#11181C',
    fontWeight: '700',
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navBtnCircle: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1E2030',
    borderWidth: 1,
    borderColor: '#2A2D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#FF5C5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  nextBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
