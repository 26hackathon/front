import {
  StyleSheet,
  View,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ui/themed-text';
import { ThemedView } from '@/components/ui/themed-view';

// Safe require for expo-camera
let CameraView: any = null;
let useCameraPermissions: any = null;
try {
  const expoCamera = require('expo-camera');
  CameraView = expoCamera.CameraView;
  useCameraPermissions = expoCamera.useCameraPermissions;
} catch (e) {}

// Brick colors matching the mockup (dark red, mid gray, dark gray)
const BRICK_PREVIEWS = [
  { color: '#9B2222', width: 90, height: 60 },
  { color: '#777777', width: 68, height: 60 },
  { color: '#3A3A4A', width: 68, height: 60 },
];

function useSafePermissions() {
  if (useCameraPermissions) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useCameraPermissions();
  }
  return [null, () => {}] as const;
}

export default function ScanScreen() {
  const hasCameraPackage = !!CameraView;
  const [permission, requestPermission] = useSafePermissions();

  return (
    <ThemedView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>브릭 스캔</ThemedText>
      </View>

      {/* CAMERA VIEWFINDER */}
      <View style={styles.viewfinderWrapper}>
        {hasCameraPackage && permission?.granted ? (
          (() => {
            const ExpoCameraView = CameraView;
            return (
              <ExpoCameraView style={styles.cameraView} facing="back">
                {/* Corner scan markers */}
                <View style={styles.cornerTL} />
                <View style={styles.cornerTR} />
                <View style={styles.cornerBL} />
                <View style={styles.cornerBR} />
              </ExpoCameraView>
            );
          })()
        ) : (
          <View style={styles.simulatedView}>
            {/* Viewfinder corner markers — mimicking the scan frame from mockup */}
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />

            {/* Brick color sample blocks in center */}
            <View style={styles.brickRow}>
              {BRICK_PREVIEWS.map((brick, i) => (
                <View
                  key={i}
                  style={[
                    styles.brickBlock,
                    { backgroundColor: brick.color, width: brick.width, height: brick.height }
                  ]}
                />
              ))}
            </View>

            {/* Hint text */}
            <ThemedText style={styles.hintText}>
              브릭을 프레임 안에 위치하거나 번호를 알고있다면 클릭하세요.
            </ThemedText>
          </View>
        )}
      </View>

      {/* BOTTOM SECTION */}
      <View style={styles.bottomSection}>
        {/* SCAN START BUTTON */}
        <Pressable
          style={({ pressed }) => [
            styles.scanBtn,
            { backgroundColor: pressed ? '#D02E2E' : '#FF2E2E' }
          ]}
          onPress={() => {
            if (hasCameraPackage && !permission?.granted) {
              requestPermission?.();
            }
          }}
        >
          <ThemedText style={styles.scanBtnText}>스캔 시작</ThemedText>
        </Pressable>

        {/* INFO NOTICE */}
        <View style={styles.infoCard}>
          <Ionicons name="location" size={16} color="#FF9F43" style={{ marginTop: 1 }} />
          <ThemedText style={styles.infoText}>
            스캔 이전 부품을 정렬하고 분별할 수 있도록 스캔 준비를 해주세요.
          </ThemedText>
        </View>
      </View>
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
  header: {
    marginBottom: 20,
    marginTop: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  viewfinderWrapper: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    marginBottom: 20,
  },
  cameraView: {
    flex: 1,
  },
  simulatedView: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 22,
    position: 'relative',
  },
  // Corner viewfinder markers — 4 corner brackets
  cornerTL: {
    position: 'absolute',
    top: 24,
    left: 24,
    width: 32,
    height: 32,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  cornerTR: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 32,
    height: 32,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
  },
  cornerBL: {
    position: 'absolute',
    bottom: 24,
    left: 24,
    width: 32,
    height: 32,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#FFFFFF',
  },
  cornerBR: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 32,
    height: 32,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#FFFFFF',
  },
  brickRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  brickBlock: {
    borderRadius: 8,
  },
  hintText: {
    color: '#8B8FA3',
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 32,
    fontWeight: '500',
    lineHeight: 20,
  },
  bottomSection: {
    gap: 12,
    paddingBottom: Platform.OS === 'ios' ? 100 : 85,
  },
  scanBtn: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#1A1510',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#3A2E18',
  },
  infoText: {
    flex: 1,
    color: '#FF9F43',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500',
  },
});
