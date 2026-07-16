import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, PanResponder, StyleSheet, View, ViewStyle } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Polygon,
  Rect,
  Stop,
  Text as SvgText,
  LinearGradient,
} from 'react-native-svg';

import {
  getPartStudDimensions,
  type LDrawPart,
  type LDrawStep,
  parseLDrawSteps,
  LDRAW_COLOR_MAP,
} from '@/features/assembly/data/sample-ldraw';
import { ASSEMBLY_SAMPLE_LDRAW } from '@/features/assembly/data/assembly-sample-ldraw';

type Assembly3DViewerProps = {
  step: number;
  zoomLevel: number;
  style?: ViewStyle;
};

type RenderPart = LDrawPart & {
  stepNumber: number;
  isCurrentStep: boolean;
};

const CANVAS_WIDTH = 1000;
const CANVAS_HEIGHT = 720;
const DRAWING_PADDING = 84;
const DRAWING_CENTER_X = CANVAS_WIDTH / 2;
const DRAWING_CENTER_Y = CANVAS_HEIGHT / 2 + 20;

export function Assembly3DViewer({ step, zoomLevel, style }: Assembly3DViewerProps) {
  const [steps, setSteps] = useState<LDrawStep[] | null>(null);
  const [rotationY, setRotationY] = useState(35);
  const [rotationX, setRotationX] = useState(18);

  useEffect(() => {
    const timer = setInterval(() => {
      setRotationY((currentRotation) => (currentRotation + 0.15) % 360);
    }, 60);

    return () => clearInterval(timer);
  }, []);

  const panResponder = useMemo(() => {
    return PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dx) > 2 || Math.abs(gestureState.dy) > 2,
      onPanResponderMove: (_, gestureState) => {
        if (Math.abs(gestureState.dx) > Math.abs(gestureState.dy)) {
          setRotationY((currentRotation) => currentRotation + gestureState.dx * 0.35);
          return;
        }

        setRotationX((currentRotation) => clamp(currentRotation + gestureState.dy * 0.22, -70, 70));
      },
      onPanResponderTerminationRequest: () => true,
    });
  }, []);

  useEffect(() => {
    setSteps(parseLDrawSteps(ASSEMBLY_SAMPLE_LDRAW));
  }, []);

  const safeSteps = steps ?? [];
  const activeStep = Math.max(1, Math.min(step, Math.max(safeSteps.length, 1)));
  const visibleSteps = safeSteps.slice(0, activeStep);

  const renderParts = useMemo(() => {
    return visibleSteps.flatMap((currentStep) =>
      currentStep.parts.map((part) => ({
        ...part,
        stepNumber: currentStep.stepNumber,
        isCurrentStep: currentStep.stepNumber === activeStep,
      })),
    );
  }, [visibleSteps, activeStep]);

  const renderBounds = useMemo(() => getProjectedBounds(renderParts, rotationX, rotationY), [renderParts, rotationX, rotationY]);
  const renderScale = useMemo(() => {
    if (!renderBounds) {
      return zoomLevel;
    }

    const availableWidth = CANVAS_WIDTH - DRAWING_PADDING * 2;
    const availableHeight = CANVAS_HEIGHT - DRAWING_PADDING * 2;
    const fitScale = Math.min(availableWidth / renderBounds.width, availableHeight / renderBounds.height);

    return Math.max(10, fitScale * (0.9 + (zoomLevel - 1) * 0.55));
  }, [renderBounds, zoomLevel]);

  if (!steps) {
    return (
      <View style={[styles.loadingContainer, style]}>
        <ActivityIndicator size="large" color="#FF5C5C" />
      </View>
    );
  }

  const renderOrigin = getRenderOrigin(renderBounds, renderScale);

  return (
    <View style={[styles.container, style]} {...panResponder.panHandlers}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`} preserveAspectRatio="xMidYMid meet">
        <Defs>
          <LinearGradient id="brickTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.18" />
            <Stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
          </LinearGradient>
        </Defs>

        <Rect x="0" y="0" width={CANVAS_WIDTH} height={CANVAS_HEIGHT} fill="#F5F6FA" />

        {renderGrid(renderBounds, renderScale, renderOrigin, rotationX, rotationY)}

        <G>
          {renderParts
            .slice()
            .sort((left, right) => left.stepNumber - right.stepNumber || left.position[1] - right.position[1])
            .map((part, index) => renderBrick(part, index, renderScale, renderOrigin, activeStep, rotationX, rotationY))}
        </G>
      </Svg>
    </View>
  );
}

function renderGrid(
  bounds: ReturnType<typeof getProjectedBounds>,
  scale: number,
  origin: { x: number; y: number },
  rotationX: number,
  rotationY: number,
) {
  if (!bounds) {
    return null;
  }

  const gridLines = [];
  const gridStep = 20;
  const minX = Math.floor(bounds.minStudX / gridStep) * gridStep - gridStep * 2;
  const maxX = Math.ceil(bounds.maxStudX / gridStep) * gridStep + gridStep * 2;
  const minZ = Math.floor(bounds.minStudZ / gridStep) * gridStep - gridStep * 2;
  const maxZ = Math.ceil(bounds.maxStudZ / gridStep) * gridStep + gridStep * 2;

  for (let x = minX; x <= maxX; x += gridStep) {
    const start = projectIso({ x, y: 0, z: minZ }, scale, origin, rotationX, rotationY);
    const end = projectIso({ x, y: 0, z: maxZ }, scale, origin, rotationX, rotationY);
    gridLines.push(
      <Line key={`grid-x-${x}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#DFE3EC" strokeWidth={1} />,
    );
  }

  for (let z = minZ; z <= maxZ; z += gridStep) {
    const start = projectIso({ x: minX, y: 0, z }, scale, origin, rotationX, rotationY);
    const end = projectIso({ x: maxX, y: 0, z }, scale, origin, rotationX, rotationY);
    gridLines.push(
      <Line key={`grid-z-${z}`} x1={start.x} y1={start.y} x2={end.x} y2={end.y} stroke="#DFE3EC" strokeWidth={1} />,
    );
  }

  const axisLeft = projectIso({ x: minX, y: 0, z: 0 }, scale, origin, rotationX, rotationY);
  const axisRight = projectIso({ x: maxX, y: 0, z: 0 }, scale, origin, rotationX, rotationY);
  const axisFront = projectIso({ x: 0, y: 0, z: minZ }, scale, origin, rotationX, rotationY);
  const axisBack = projectIso({ x: 0, y: 0, z: maxZ }, scale, origin, rotationX, rotationY);

  gridLines.push(
    <Line key="axis-x" x1={axisLeft.x} y1={axisLeft.y} x2={axisRight.x} y2={axisRight.y} stroke="#AAB1C4" strokeWidth={2} />,
    <Line key="axis-z" x1={axisFront.x} y1={axisFront.y} x2={axisBack.x} y2={axisBack.y} stroke="#AAB1C4" strokeWidth={2} />,
  );

  return <G opacity={0.95}>{gridLines}</G>;
}

function renderBrick(
  part: RenderPart,
  index: number,
  scale: number,
  origin: { x: number; y: number },
  activeStep: number,
  rotationX: number,
  rotationY: number,
) {
  const dimensions = getPartStudDimensions(part.partName);
  const halfWidth = dimensions.width * 10;
  const halfHeight = dimensions.height * 10;
  const halfDepth = dimensions.depth * 10;
  const [centerX, centerY, centerZ] = part.position;

  const points = {
    topBackLeft: projectIso({ x: centerX - halfWidth, y: centerY + halfHeight, z: centerZ - halfDepth }, scale, origin, rotationX, rotationY),
    topBackRight: projectIso({ x: centerX + halfWidth, y: centerY + halfHeight, z: centerZ - halfDepth }, scale, origin, rotationX, rotationY),
    topFrontRight: projectIso({ x: centerX + halfWidth, y: centerY + halfHeight, z: centerZ + halfDepth }, scale, origin, rotationX, rotationY),
    topFrontLeft: projectIso({ x: centerX - halfWidth, y: centerY + halfHeight, z: centerZ + halfDepth }, scale, origin, rotationX, rotationY),
    bottomBackLeft: projectIso({ x: centerX - halfWidth, y: centerY - halfHeight, z: centerZ - halfDepth }, scale, origin, rotationX, rotationY),
    bottomBackRight: projectIso({ x: centerX + halfWidth, y: centerY - halfHeight, z: centerZ - halfDepth }, scale, origin, rotationX, rotationY),
    bottomFrontRight: projectIso({ x: centerX + halfWidth, y: centerY - halfHeight, z: centerZ + halfDepth }, scale, origin, rotationX, rotationY),
    bottomFrontLeft: projectIso({ x: centerX - halfWidth, y: centerY - halfHeight, z: centerZ + halfDepth }, scale, origin, rotationX, rotationY),
  };

  const baseColor = LDRAW_COLOR_MAP[part.colorCode] ?? '#D0D4DB';
  const currentOpacity = part.isCurrentStep ? 0.98 : 0.22;
  const isCurrentStep = part.isCurrentStep && part.stepNumber === activeStep;

  const topFace = toPointList([
    points.topBackLeft,
    points.topBackRight,
    points.topFrontRight,
    points.topFrontLeft,
  ]);
  const leftFace = toPointList([
    points.bottomBackLeft,
    points.topBackLeft,
    points.topFrontLeft,
    points.bottomFrontLeft,
  ]);
  const rightFace = toPointList([
    points.bottomBackRight,
    points.topBackRight,
    points.topFrontRight,
    points.bottomFrontRight,
  ]);

  const studColumns = Math.max(1, Math.round(dimensions.width));
  const studRows = Math.max(1, Math.round(dimensions.depth));
  const studs = [];

  for (let column = 0; column < studColumns; column += 1) {
    for (let row = 0; row < studRows; row += 1) {
      const studX = centerX - halfWidth + 10 + column * 20;
      const studZ = centerZ - halfDepth + 10 + row * 20;
      const stud = projectIso({ x: studX, y: centerY + halfHeight + 1, z: studZ }, scale, origin, rotationX, rotationY);

      studs.push(
        <Circle
          key={`${part.partName}-${index}-stud-${column}-${row}`}
          cx={stud.x}
          cy={stud.y}
          r={Math.max(1.2, scale * 0.07)}
          fill="#FFFFFF"
          fillOpacity={isCurrentStep ? 0.78 : 0.38}
          stroke="#4B5568"
          strokeOpacity={isCurrentStep ? 0.35 : 0.2}
          strokeWidth={0.8}
        />,
      );
    }
  }

  return (
    <G key={`${part.stepNumber}-${part.partName}-${index}`} opacity={currentOpacity}>
      <Polygon points={leftFace} fill={mixColor(baseColor, '#000000', 0.18)} stroke="#6B7285" strokeWidth={1} />
      <Polygon points={rightFace} fill={mixColor(baseColor, '#000000', 0.12)} stroke="#6B7285" strokeWidth={1} />
      <Polygon points={topFace} fill={baseColor} stroke="#6B7285" strokeWidth={1.2} />
      <Polygon points={topFace} fill="url(#brickTop)" opacity={0.9} />
      {studs}
      {isCurrentStep && (
        <Polygon
          points={topFace}
          fill="none"
          stroke="#FF5C5C"
          strokeWidth={2.5}
          strokeDasharray="8 5"
        />
      )}
    </G>
  );
}

function getProjectedBounds(parts: RenderPart[], rotationX: number, rotationY: number) {
  if (parts.length === 0) {
    return null;
  }

  let minProjectedX = Number.POSITIVE_INFINITY;
  let minProjectedY = Number.POSITIVE_INFINITY;
  let maxProjectedX = Number.NEGATIVE_INFINITY;
  let maxProjectedY = Number.NEGATIVE_INFINITY;
  let minStudX = Number.POSITIVE_INFINITY;
  let maxStudX = Number.NEGATIVE_INFINITY;
  let minStudZ = Number.POSITIVE_INFINITY;
  let maxStudZ = Number.NEGATIVE_INFINITY;

  parts.forEach((part) => {
    const dimensions = getPartStudDimensions(part.partName);
    const halfWidth = dimensions.width * 10;
    const halfHeight = dimensions.height * 10;
    const halfDepth = dimensions.depth * 10;
    const [centerX, centerY, centerZ] = part.position;
    const corners = [
      { x: centerX - halfWidth, y: centerY - halfHeight, z: centerZ - halfDepth },
      { x: centerX + halfWidth, y: centerY - halfHeight, z: centerZ - halfDepth },
      { x: centerX + halfWidth, y: centerY - halfHeight, z: centerZ + halfDepth },
      { x: centerX - halfWidth, y: centerY - halfHeight, z: centerZ + halfDepth },
      { x: centerX - halfWidth, y: centerY + halfHeight, z: centerZ - halfDepth },
      { x: centerX + halfWidth, y: centerY + halfHeight, z: centerZ - halfDepth },
      { x: centerX + halfWidth, y: centerY + halfHeight, z: centerZ + halfDepth },
      { x: centerX - halfWidth, y: centerY + halfHeight, z: centerZ + halfDepth },
    ];

    corners.forEach((corner) => {
      const projected = projectIso(corner, 1, { x: 0, y: 0 }, rotationX, rotationY);
      minProjectedX = Math.min(minProjectedX, projected.x);
      minProjectedY = Math.min(minProjectedY, projected.y);
      maxProjectedX = Math.max(maxProjectedX, projected.x);
      maxProjectedY = Math.max(maxProjectedY, projected.y);
      minStudX = Math.min(minStudX, corner.x);
      maxStudX = Math.max(maxStudX, corner.x);
      minStudZ = Math.min(minStudZ, corner.z);
      maxStudZ = Math.max(maxStudZ, corner.z);
    });
  });

  return {
    minProjectedX,
    minProjectedY,
    maxProjectedX,
    maxProjectedY,
    width: Math.max(1, maxProjectedX - minProjectedX),
    height: Math.max(1, maxProjectedY - minProjectedY),
    minStudX,
    maxStudX,
    minStudZ,
    maxStudZ,
  };
}

function getRenderOrigin(
  bounds: ReturnType<typeof getProjectedBounds>,
  scale: number,
) {
  if (!bounds) {
    return {
      x: DRAWING_CENTER_X,
      y: DRAWING_CENTER_Y,
    };
  }

  return {
    x: DRAWING_CENTER_X - ((bounds.minProjectedX + bounds.maxProjectedX) * scale) / 2,
    y: DRAWING_CENTER_Y - ((bounds.minProjectedY + bounds.maxProjectedY) * scale) / 2,
  };
}

function projectIso(
  point: { x: number; y: number; z: number },
  scale: number,
  origin: { x: number; y: number },
  rotationX: number,
  rotationY: number,
) {
  const tilted = rotateX(point, rotationX);
  const rotated = rotateY(tilted, rotationY);

  return {
    x: origin.x + (rotated.x - rotated.z) * scale * 0.5,
    y: origin.y + (rotated.x + rotated.z) * scale * 0.24 - rotated.y * scale * 0.5,
  };
}

function rotateX(point: { x: number; y: number; z: number }, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  return {
    x: point.x,
    y: point.y * cos - point.z * sin,
    z: point.y * sin + point.z * cos,
  };
}

function rotateY(point: { x: number; y: number; z: number }, rotation: number) {
  const radians = (rotation * Math.PI) / 180;
  const sin = Math.sin(radians);
  const cos = Math.cos(radians);

  return {
    x: point.x * cos - point.z * sin,
    y: point.y,
    z: point.x * sin + point.z * cos,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function toPointList(points: { x: number; y: number }[]) {
  return points.map((point) => `${point.x},${point.y}`).join(' ');
}

function mixColor(baseColor: string, mixColorValue: string, weight: number) {
  const base = hexToRgb(baseColor);
  const mix = hexToRgb(mixColorValue);

  if (!base || !mix) {
    return baseColor;
  }

  const red = Math.round(base.red * (1 - weight) + mix.red * weight);
  const green = Math.round(base.green * (1 - weight) + mix.green * weight);
  const blue = Math.round(base.blue * (1 - weight) + mix.blue * weight);

  return `rgb(${red}, ${green}, ${blue})`;
}

function hexToRgb(value: string) {
  const normalized = value.replace('#', '');

  if (normalized.length !== 6) {
    return null;
  }

  return {
    red: Number.parseInt(normalized.slice(0, 2), 16),
    green: Number.parseInt(normalized.slice(2, 4), 16),
    blue: Number.parseInt(normalized.slice(4, 6), 16),
  };
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F6FA',
  },
});