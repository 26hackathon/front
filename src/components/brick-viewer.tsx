import { getHexColor, getLDrawPart, type LDrawPart } from '@/lib/brickLoader';
import { BrickData } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InteractionManager, PanResponder, Pressable, StyleSheet, View } from 'react-native';
import * as THREE from 'three';

type LDrawLoaderInstance = import('three/examples/jsm/loaders/LDrawLoader.js').LDrawLoader;

const LDRAW_LIBRARY_ROOT =
  'https://library.ldraw.org/library/official/';

interface BrickViewerProps {
  bricks: BrickData[];
}

interface BrickSceneEntry {
  brick: BrickData;
  partInfo: LDrawPart;
  color: string;
  key: string;
  existing?: THREE.Group;
  fallback?: THREE.Group;
  container?: THREE.Group;
}

export default function BrickViewer({ bricks }: BrickViewerProps) {
  const [rotation, setRotation] = useState({ x: 62, y: 45, z: 0 });
  const [cameraDistance, setCameraDistance] = useState(10);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const brickMeshesRef = useRef<THREE.Group[]>([]);
  const brickMeshMapRef = useRef(new Map<string, THREE.Group>());
  const createBrickMeshesRef = useRef<(scene: THREE.Scene, brickData: BrickData[]) => Promise<void>>(
    async () => undefined
  );
  const rotationRef = useRef(rotation);
  const cameraDistanceRef = useRef(cameraDistance);
  const frameIdRef = useRef<number | null>(null);
  const cameraTargetRef = useRef(new THREE.Vector3());
  const gestureRotationRef = useRef(rotation);
  const pinchDistanceRef = useRef<number | null>(null);
  const pinchCameraDistanceRef = useRef(cameraDistance);
  const ldrawLoaderRef = useRef<LDrawLoaderInstance | null>(null);
  const ldrawModelCacheRef = useRef(new Map<string, THREE.Group>());
  const ldrawRequestCacheRef = useRef(new Map<string, Promise<THREE.Group>>());

  const panResponder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) =>
      Math.abs(gesture.dx) > 3 || Math.abs(gesture.dy) > 3 || gesture.numberActiveTouches > 1,
    onPanResponderGrant: event => {
      gestureRotationRef.current = rotationRef.current;
      pinchCameraDistanceRef.current = cameraDistanceRef.current;
      const touches = event.nativeEvent.touches;
      if (touches.length === 2) {
        pinchDistanceRef.current = Math.hypot(
          touches[0].pageX - touches[1].pageX,
          touches[0].pageY - touches[1].pageY
        );
      }
    },
    onPanResponderMove: (event, gesture) => {
      const touches = event.nativeEvent.touches;
      if (touches.length === 2) {
        const distance = Math.hypot(
          touches[0].pageX - touches[1].pageX,
          touches[0].pageY - touches[1].pageY
        );
        if (pinchDistanceRef.current) {
          const scale = pinchDistanceRef.current / Math.max(distance, 1);
          setCameraDistance(
            THREE.MathUtils.clamp(pinchCameraDistanceRef.current * scale, 3.5, 24)
          );
        }
        return;
      }

      setRotation({
        x: THREE.MathUtils.clamp(gestureRotationRef.current.x - gesture.dy * 0.35, 12, 168),
        y: gestureRotationRef.current.y + gesture.dx * 0.45,
        z: 0,
      });
    },
    onPanResponderRelease: () => {
      pinchDistanceRef.current = null;
    },
    onPanResponderTerminate: () => {
      pinchDistanceRef.current = null;
    },
  }), []);

  useEffect(() => {
    rotationRef.current = rotation;
  }, [rotation]);

  useEffect(() => {
    cameraDistanceRef.current = cameraDistance;
  }, [cameraDistance]);
  
  const onContextCreate = (gl: any) => {
    const { drawingBufferWidth: width, drawingBufferHeight: height } = gl;
    
    // Create renderer
    // THREE.WebGLRenderer creates an HTML canvas and accesses `document`.
    // expo-three's Renderer supplies the canvas shim required by Expo GL.
    const renderer = new Renderer({
      gl,
      width,
      height,
      clearColor: 0xD9ECFF,
    });
    rendererRef.current = renderer;

    // Create scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 5);
    scene.add(directionalLight);

    // Create brick meshes
    createBrickMeshes(scene, bricks).catch(console.error);

    // Animation loop
    function render() {
      frameIdRef.current = requestAnimationFrame(render);
      
      // Update camera rotation based on state
      if (cameraRef.current) {
        const radius = cameraDistanceRef.current;
        const theta = THREE.MathUtils.degToRad(rotationRef.current.y);
        const phi = THREE.MathUtils.degToRad(rotationRef.current.x);
        
        cameraRef.current.position.x = radius * Math.sin(phi) * Math.cos(theta);
        cameraRef.current.position.y = radius * Math.cos(phi);
        cameraRef.current.position.z = radius * Math.sin(phi) * Math.sin(theta);
        cameraRef.current.lookAt(cameraTargetRef.current);
      }
      
      renderer.render(scene, camera);
      gl.endFrameEXP();
    }
    render();
  };

  useEffect(() => () => {
    if (frameIdRef.current !== null) {
      cancelAnimationFrame(frameIdRef.current);
    }
    rendererRef.current?.dispose();
    rendererRef.current = null;
  }, []);

  const createBrickMeshes = async (scene: THREE.Scene, brickData: BrickData[]) => {
    const entries: BrickSceneEntry[] = [];
    brickData.forEach((brick, index) => {
      const partInfo = getLDrawPart(brick.brickId);
      if (!partInfo) return;

      const color = getHexColor(brick.colorCode);
      const key = getBrickKey(brick, index);
      const existing = brickMeshMapRef.current.get(key);
      if (existing) {
        entries.push({ brick, partInfo, color, key, existing });
        return;
      }

      const fallback = createProceduralBrickMesh(
        partInfo,
        color,
        brick.position,
        brick.rotation
      );
      entries.push({ brick, partInfo, color, key, fallback });
    });

    const desiredKeys = new Set(entries.map(({ key }) => key));

    // Going back a step removes only the bricks no longer present.
    brickMeshMapRef.current.forEach((mesh, key) => {
      if (desiredKeys.has(key)) return;
      scene.remove(mesh);
      brickMeshMapRef.current.delete(key);
    });

    // Going forward adds only the newly introduced bricks.
    const addedEntries = entries.filter(
      (entry): entry is BrickSceneEntry & { fallback: THREE.Group } => Boolean(entry.fallback)
    );
    addedEntries.forEach(entry => {
      const container = new THREE.Group();
      container.add(entry.fallback);
      entry.container = container;
      scene.add(container);
      brickMeshMapRef.current.set(entry.key, container);
    });

    brickMeshesRef.current = Array.from(brickMeshMapRef.current.values());

    if (brickMeshesRef.current.length > 0) {
      fitCameraToModels();
    }

    // Give Expo GL a frame to present the immediate geometry before starting
    // the heavier LDraw parser and network work.
    await new Promise<void>(resolve => {
      InteractionManager.runAfterInteractions(() => resolve());
    });

    await Promise.allSettled(addedEntries.map(async ({ brick, color, key, container }) => {
      if (!container) return;
      const ldrawModel = await createLegoBrickMesh(
        brick.brickId,
        color,
        brick.position,
        brick.rotation
      );

      // The user may have returned to a previous step while this part loaded.
      // Replace it only when its temporary mesh is still the active one.
      if (
        sceneRef.current !== scene ||
        brickMeshMapRef.current.get(key) !== container
      ) return;

      const ldrawBounds = new THREE.Box3().setFromObject(ldrawModel);
      const ldrawSize = ldrawBounds.getSize(new THREE.Vector3());
      const maxDimension = Math.max(ldrawSize.x, ldrawSize.y, ldrawSize.z);

      // Keep the immediate mesh in the container. It guarantees that the
      // brick remains visible even if a device cannot draw the loaded LDraw
      // geometry correctly. Valid LDraw geometry is layered into the same
      // container without changing the proven camera framing.
      if (!ldrawBounds.isEmpty() && Number.isFinite(maxDimension) && maxDimension < 20) {
        container.add(ldrawModel);
      }
    }));
  };

  const getBrickKey = (brick: BrickData, index: number) => [
    index,
    brick.brickId,
    brick.colorCode,
    brick.position.x,
    brick.position.y,
    brick.position.z,
    brick.rotation.x,
    brick.rotation.y,
    brick.rotation.z,
  ].join(':');

  const fitCameraToModels = () => {
    const bounds = new THREE.Box3();
    brickMeshesRef.current.forEach(group => bounds.expandByObject(group));
    if (bounds.isEmpty()) return;

    const center = bounds.getCenter(new THREE.Vector3());
    const size = bounds.getSize(new THREE.Vector3());
    const fittedDistance = THREE.MathUtils.clamp(Math.max(size.x, size.y, size.z) * 2.2, 6, 18);
    cameraTargetRef.current.copy(center);
    setCameraDistance(fittedDistance);
  };

  const createLegoBrickMesh = async (
    brickId: string,
    color: string, 
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number }
  ): Promise<THREE.Group> => {
    try {
      if (!ldrawLoaderRef.current) {
        const { LDrawLoader } = await import('three/examples/jsm/loaders/LDrawLoader.js');
        ldrawLoaderRef.current = new LDrawLoader();
        ldrawLoaderRef.current.setPartsLibraryPath(LDRAW_LIBRARY_ROOT);
        ldrawLoaderRef.current.setFileMap({
          'stud.dat': 'p/stud.dat',
          'stud4.dat': 'p/stud4.dat',
          'box5.dat': 'p/box5.dat',
        });
      }

      let sourceModel = ldrawModelCacheRef.current.get(brickId);
      if (!sourceModel) {
        let request = ldrawRequestCacheRef.current.get(brickId);
        if (!request) {
          request = Promise.race([
            new Promise<THREE.Group>((resolve, reject) => {
              ldrawLoaderRef.current!.load(
                `${LDRAW_LIBRARY_ROOT}parts/${brickId}.dat`,
                resolve,
                undefined,
                reject
              );
            }),
            new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('LDraw request timed out')), 5000);
            }),
          ]);
          ldrawRequestCacheRef.current.set(brickId, request);
        }

        try {
          sourceModel = await request;
        } finally {
          ldrawRequestCacheRef.current.delete(brickId);
        }
        ldrawModelCacheRef.current.set(brickId, sourceModel);
      }
      const model = sourceModel.clone(true);

      const material = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.28,
        metalness: 0.04,
      });

      model.traverse(child => {
        if (child instanceof THREE.Mesh) child.material = material;
      });

      // LDraw uses 20 units per stud and an inverted vertical axis.
      model.scale.setScalar(0.05);
      model.rotation.x = Math.PI + THREE.MathUtils.degToRad(rotation.x);
      model.rotation.y = THREE.MathUtils.degToRad(rotation.y);
      model.rotation.z = THREE.MathUtils.degToRad(rotation.z);
      model.position.set(position.x, position.y, position.z);
      return model;
    } catch (error) {
      console.warn(`LDraw part ${brickId} could not be loaded.`, error);
      throw error;
    }
  };

  const createProceduralBrickMesh = (
    partInfo: any, 
    color: string, 
    position: { x: number; y: number; z: number },
    rotation: { x: number; y: number; z: number }
  ): THREE.Group => {
    const brickGroup = new THREE.Group();
    
    // LEGO unit system: 1 stud = 1.0, 1 plate = 0.4, 1 brick = 1.2 (3 plates)
    const PLATE_H = 0.4;
    const T = 0.12; // Wall thickness
    
    const w = partInfo.w;
    const d = partInfo.d;
    const h = partInfo.plates * PLATE_H;
    const shape = partInfo.shape;
    const studs = partInfo.studs;
    
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.28,
      metalness: 0.06,
    });

    // Create main brick body based on shape
    if (shape === 'round' || shape === 'round_plate') {
      const r = Math.min(w, d) / 2;
      const outer = new THREE.Mesh(
        new THREE.CylinderGeometry(r, r, h - T, 24, 1, true),
        material
      );
      outer.position.y = -T / 2;
      brickGroup.add(outer);

      const cap = new THREE.Mesh(new THREE.CylinderGeometry(r, r, T, 24), material);
      cap.position.y = h / 2 - T / 2;
      brickGroup.add(cap);
    } else if (shape === 'cone' || shape === 'cone22') {
      const topR = shape === 'cone22' ? Math.min(w, d) * 0.08 : 0.06;
      const botR = Math.min(w, d) / 2 * 0.95;
      const cone = new THREE.Mesh(
        new THREE.CylinderGeometry(topR, botR, h, 24),
        material
      );
      brickGroup.add(cone);
    } else {
      // Standard brick/plate/tile
      const topMesh = new THREE.Mesh(new THREE.BoxGeometry(w, T, d), material);
      topMesh.position.y = h / 2 - T / 2;
      brickGroup.add(topMesh);

      if (d > T) {
        const frontGeom = new THREE.BoxGeometry(w, h - T, T);
        const front = new THREE.Mesh(frontGeom, material);
        front.position.set(0, -T / 2, d / 2 - T / 2);
        brickGroup.add(front);
        const back = new THREE.Mesh(frontGeom, material);
        back.position.set(0, -T / 2, -(d / 2) + T / 2);
        brickGroup.add(back);
      }

      if (w > T) {
        const sideGeom = new THREE.BoxGeometry(T, h - T, Math.max(0.01, d - 2 * T));
        const left = new THREE.Mesh(sideGeom, material);
        left.position.set(-(w / 2) + T / 2, -T / 2, 0);
        brickGroup.add(left);
        const right = new THREE.Mesh(sideGeom, material);
        right.position.set(w / 2 - T / 2, -T / 2, 0);
        brickGroup.add(right);
      }
    }

    // Add studs
    const noStudShapes = ['tile', 'cone', 'cone22', 'cheese', 'arch', 'slope', 'inv_slope', 'round_tile'];
    if (studs && !noStudShapes.includes(shape)) {
      const studGeom = new THREE.CylinderGeometry(0.3, 0.3, 0.18, 12);
      const startX = -((w - 1) * 1.0) / 2;
      const startZ = -((d - 1) * 1.0) / 2;
      
      for (let x = 0; x < w; x++) {
        for (let z = 0; z < d; z++) {
          const stud = new THREE.Mesh(studGeom, material);
          stud.position.set(startX + x, h / 2 + 0.09, startZ + z);
          brickGroup.add(stud);
        }
      }
    }

    // Set position and rotation
    brickGroup.position.set(position.x, position.y, position.z);
    brickGroup.rotation.x = THREE.MathUtils.degToRad(rotation.x);
    brickGroup.rotation.y = THREE.MathUtils.degToRad(rotation.y);
    brickGroup.rotation.z = THREE.MathUtils.degToRad(rotation.z);

    return brickGroup;
  };

  createBrickMeshesRef.current = createBrickMeshes;

  // Update meshes when bricks change
  useEffect(() => {
    if (sceneRef.current) {
      createBrickMeshesRef.current(sceneRef.current, bricks);
    }
  }, [bricks]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <GLView style={styles.canvas} onContextCreate={onContextCreate} />
      
      <View style={styles.zoomControls}>
        <Pressable 
          accessibilityLabel="축소"
          style={styles.zoomButton}
          onPress={() => setCameraDistance(distance => Math.min(18, distance + 1.5))}
        >
          <Ionicons name="search-outline" size={17} color="#FFFFFF" />
          <Ionicons name="remove" size={9} color="#FFFFFF" style={styles.zoomSign} />
        </Pressable>
        <Pressable 
          accessibilityLabel="확대"
          style={styles.zoomButton}
          onPress={() => setCameraDistance(distance => Math.max(5, distance - 1.5))}
        >
          <Ionicons name="search-outline" size={17} color="#FFFFFF" />
          <Ionicons name="add" size={9} color="#FFFFFF" style={styles.zoomSign} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  canvas: {
    flex: 1,
    backgroundColor: '#D9ECFF',
  },
  zoomControls: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    gap: 7,
    zIndex: 3,
  },
  zoomButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#29313D',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  zoomSign: {
    position: 'absolute',
    right: 5,
    bottom: 5,
  },
});
