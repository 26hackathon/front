import { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

export default function ScanScreen() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanStart = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      Alert.alert('스캔 완료', '영상 속 레고 브릭 5개가 성공적으로 감지되었습니다.');
    }, 2000);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>브릭 스캔</ThemedText>
          <ThemedText style={styles.headerSubtitle}>카메라로 브릭을 비추거나 사진을 불러오세요</ThemedText>
        </View>

        {/* SCAN WINDOW CONTAINER */}
        <View style={styles.scanWindowContainer}>
          <View style={styles.cornerTopLeft} />
          <View style={styles.cornerTopRight} />
          <View style={styles.cornerBottomLeft} />
          <View style={styles.cornerBottomRight} />

          {/* DUMMY BRICKS DETECTED */}
          <View style={[styles.detectedBrick, styles.brickRed, { top: 60, left: 50, width: 80, height: 40 }]} />
          <View style={[styles.detectedBrick, styles.brickYellow, { top: 90, right: 60, width: 60, height: 30 }]} />
          <View style={[styles.detectedBrick, styles.brickBlue, { bottom: 80, left: 80, width: 90, height: 30 }]} />
          <View style={[styles.detectedBrick, styles.brickGrey, { bottom: 70, right: 50, width: 70, height: 50 }]} />

          <ThemedText style={styles.scanHint}>브릭을 프레임 안에 넣으세요</ThemedText>
        </View>

        {/* ACTION BUTTONS */}
        <View style={styles.btnRow}>
          <Pressable
            onPress={handleScanStart}
            disabled={isScanning}
            style={({ pressed }) => [
              styles.scanBtn,
              { backgroundColor: pressed ? '#E04B4B' : '#FF5C5C' }
            ]}
          >
            <Ionicons name="scan" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <ThemedText style={styles.scanBtnText}>
              {isScanning ? '스캔 진행 중...' : '스캔 시작'}
            </ThemedText>
          </Pressable>

          <Pressable style={styles.galleryBtn}>
            <Ionicons name="images-outline" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* HELP NOTICE */}
        <View style={styles.infoCard}>
          <Ionicons name="bulb-outline" size={22} color="#FF9F43" />
          <ThemedText style={styles.infoText}>
            밝은 조명 아래서 브릭을 평평한 면에 펼쳐놓고 스캔하면 인식률이 높아집니다.
          </ThemedText>
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
  header: {
    gap: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8B8FA3',
  },
  scanWindowContainer: {
    height: 380,
    borderRadius: 24,
    backgroundColor: '#161825',
    borderWidth: 1,
    borderColor: '#2A2D3E',
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#8B8FA3',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#8B8FA3',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#8B8FA3',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#8B8FA3',
  },
  scanHint: {
    fontSize: 14,
    color: '#8B8FA3',
    fontWeight: '600',
    marginTop: 100,
  },
  detectedBrick: {
    position: 'absolute',
    borderRadius: 8,
    opacity: 0.35,
  },
  brickRed: {
    backgroundColor: '#FF5C5C',
  },
  brickYellow: {
    backgroundColor: '#FF9F43',
  },
  brickBlue: {
    backgroundColor: '#6C63FF',
  },
  brickGrey: {
    backgroundColor: '#8B8FA3',
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  scanBtn: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#FF5C5C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  galleryBtn: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#1E2030',
    borderWidth: 1,
    borderColor: '#2A2D3E',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FF9F4312',
    borderWidth: 1,
    borderColor: '#FF9F4330',
    borderRadius: 18,
    padding: 16,
    gap: 12,
    alignItems: 'center',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#FF9F43',
    lineHeight: 18,
  },
});
