export type LDrawPart = {
  colorCode: number;
  partName: string;
  position: [number, number, number];
  matrix: [number, number, number, number, number, number, number, number, number];
};

export type LDrawStep = {
  stepNumber: number;
  title: string;
  description: string;
  parts: LDrawPart[];
};

const STEP_TITLES = [
  '바닥 프레임',
  '왼쪽 벽체',
  '오른쪽 벽체',
  '뒤쪽 지지대',
  '상단 플레이트',
  '전면 디테일',
  '마무리 캡',
];

const STEP_DESCRIPTIONS = [
  '기초 프레임을 먼저 깔아 전체 설계를 고정합니다.',
  '왼쪽 벽체를 세워 바닥 위 구조를 올립니다.',
  '오른쪽 벽체를 붙여 양쪽 균형을 맞춥니다.',
  '뒤쪽 지지대를 넣어 깊이를 확보합니다.',
  '상단 플레이트로 상부를 잠그듯 고정합니다.',
  '전면 디테일을 추가해 형태를 다듬습니다.',
  '마지막 캡을 얹어 설계를 마무리합니다.',
];

const PART_DIMENSIONS: Record<string, { width: number; height: number; depth: number }> = {
  '3001.dat': { width: 96, height: 24, depth: 48 },
  '3002.dat': { width: 72, height: 24, depth: 48 },
  '3003.dat': { width: 48, height: 24, depth: 48 },
  '3004.dat': { width: 48, height: 24, depth: 24 },
  '3005.dat': { width: 24, height: 24, depth: 24 },
  '3010.dat': { width: 48, height: 24, depth: 24 },
  '3024.dat': { width: 24, height: 8, depth: 24 },
};

export const LDRAW_COLOR_MAP: Record<number, string> = {
  1: '#0055BF',
  2: '#237841',
  4: '#C91A09',
  5: '#C870A0',
  7: '#6C6E68',
  14: '#F2CD37',
  15: '#FFFFFF',
};

export const LDU_PER_STUD = 20;

export function parseLDrawSteps(source: string): LDrawStep[] {
  const steps: LDrawStep[] = [];
  let currentParts: LDrawPart[] = [];

  const pushCurrentStep = () => {
    if (currentParts.length === 0) {
      return;
    }

    const stepNumber = steps.length + 1;
    steps.push({
      stepNumber,
      title: STEP_TITLES[stepNumber - 1] ?? `Step ${stepNumber}`,
      description: STEP_DESCRIPTIONS[stepNumber - 1] ?? '조립 단계를 확인하세요.',
      parts: currentParts,
    });
    currentParts = [];
  };

  source.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      return;
    }

    if (trimmed === '0 STEP') {
      pushCurrentStep();
      return;
    }

    if (!trimmed.startsWith('1 ')) {
      return;
    }

    const tokens = trimmed.split(/\s+/);
    if (tokens.length < 15) {
      return;
    }

    const colorCode = Number(tokens[1]);
    const x = Number(tokens[2]);
    const y = Number(tokens[3]);
    const z = Number(tokens[4]);
    const matrix: [number, number, number, number, number, number, number, number, number] = [
      Number(tokens[5]),
      Number(tokens[6]),
      Number(tokens[7]),
      Number(tokens[8]),
      Number(tokens[9]),
      Number(tokens[10]),
      Number(tokens[11]),
      Number(tokens[12]),
      Number(tokens[13]),
    ];
    const partName = tokens[tokens.length - 1];

    currentParts.push({
      colorCode,
      partName,
      position: [x, y, z],
      matrix,
    });
  });

  pushCurrentStep();

  return steps;
}

export function getPartDimensions(partName: string) {
  return PART_DIMENSIONS[partName] ?? { width: 24, height: 24, depth: 24 };
}

export function getPartStudDimensions(partName: string) {
  const dimensions = getPartDimensions(partName);

  return {
    width: dimensions.width / LDU_PER_STUD,
    height: dimensions.height / LDU_PER_STUD,
    depth: dimensions.depth / LDU_PER_STUD,
  };
}