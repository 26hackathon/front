// LEGO brick loader utility
// Based on real LEGO System parts and LDraw specifications

export interface LDrawPart {
  id: string;
  name: string;
  category: string;
  w: number;  // width in studs
  d: number;  // depth in studs
  plates: number; // height in plates (1 plate = 0.4, 1 brick = 3 plates)
  shape: 'brick' | 'plate' | 'tile' | 'round' | 'round_plate' | 'round_tile' | 'cone' | 'cone22' | 'slope' | 'cheese' | 'inv_slope' | 'arch';
  studs: boolean;
}

// Real LEGO System parts (BrickLink / LEGO design IDs)
const LEGO_PARTS: Record<string, LDrawPart> = {
  // Bricks
  '3005': { id: '3005', name: 'Brick 1×1', category: '브릭', w: 1, d: 1, plates: 3, shape: 'brick', studs: true },
  '3004': { id: '3004', name: 'Brick 1×2', category: '브릭', w: 1, d: 2, plates: 3, shape: 'brick', studs: true },
  '3622': { id: '3622', name: 'Brick 1×3', category: '브릭', w: 1, d: 3, plates: 3, shape: 'brick', studs: true },
  '3010': { id: '3010', name: 'Brick 1×4', category: '브릭', w: 1, d: 4, plates: 3, shape: 'brick', studs: true },
  '3003': { id: '3003', name: 'Brick 2×2', category: '브릭', w: 2, d: 2, plates: 3, shape: 'brick', studs: true },
  '3002': { id: '3002', name: 'Brick 2×3', category: '브릭', w: 2, d: 3, plates: 3, shape: 'brick', studs: true },
  '3001': { id: '3001', name: 'Brick 2×4', category: '브릭', w: 2, d: 4, plates: 3, shape: 'brick', studs: true },
  
  // Plates
  '3024': { id: '3024', name: 'Plate 1×1', category: '플레이트', w: 1, d: 1, plates: 1, shape: 'plate', studs: true },
  '3023': { id: '3023', name: 'Plate 1×2', category: '플레이트', w: 1, d: 2, plates: 1, shape: 'plate', studs: true },
  '3710': { id: '3710', name: 'Plate 1×4', category: '플레이트', w: 1, d: 4, plates: 1, shape: 'plate', studs: true },
  '3666': { id: '3666', name: 'Plate 1×6', category: '플레이트', w: 1, d: 6, plates: 1, shape: 'plate', studs: true },
  '3022': { id: '3022', name: 'Plate 2×2', category: '플레이트', w: 2, d: 2, plates: 1, shape: 'plate', studs: true },
  '3021': { id: '3021', name: 'Plate 2×3', category: '플레이트', w: 2, d: 3, plates: 1, shape: 'plate', studs: true },
  '3020': { id: '3020', name: 'Plate 2×4', category: '플레이트', w: 2, d: 4, plates: 1, shape: 'plate', studs: true },
  
  // Tiles
  '3070b': { id: '3070b', name: 'Tile 1×1', category: '타일', w: 1, d: 1, plates: 1, shape: 'tile', studs: false },
  '3069b': { id: '3069b', name: 'Tile 1×2', category: '타일', w: 1, d: 2, plates: 1, shape: 'tile', studs: false },
  '3068b': { id: '3068b', name: 'Tile 2×2', category: '타일', w: 2, d: 2, plates: 1, shape: 'tile', studs: false },
  
  // Round
  '3062b': { id: '3062b', name: 'Brick Round 1×1', category: '원형', w: 1, d: 1, plates: 3, shape: 'round', studs: true },
  '3941': { id: '3941', name: 'Brick Round 2×2', category: '원형', w: 2, d: 2, plates: 3, shape: 'round', studs: true },
  '4073': { id: '4073', name: 'Plate Round 1×1', category: '원형', w: 1, d: 1, plates: 1, shape: 'round_plate', studs: true },
  '4032': { id: '4032', name: 'Plate Round 2×2', category: '원형', w: 2, d: 2, plates: 1, shape: 'round_plate', studs: true },
  
  // Cones
  '4589': { id: '4589', name: 'Cone 1×1', category: '원형', w: 1, d: 1, plates: 3, shape: 'cone', studs: false },
  
  // Slopes
  '3039': { id: '3039', name: 'Slope 45° 2×2', category: '슬로프', w: 2, d: 2, plates: 3, shape: 'slope', studs: true },
  '3038': { id: '3038', name: 'Slope 45° 2×3', category: '슬로프', w: 2, d: 3, plates: 3, shape: 'slope', studs: true },
  '3037': { id: '3037', name: 'Slope 45° 2×4', category: '슬로프', w: 2, d: 4, plates: 3, shape: 'slope', studs: true },
  '54200': { id: '54200', name: 'Cheese Slope 1×1', category: '슬로프', w: 1, d: 1, plates: 2, shape: 'cheese', studs: false },
  
  // Arches
  '3659': { id: '3659', name: 'Arch 1×4', category: '아치', w: 1, d: 4, plates: 3, shape: 'arch', studs: true },
  '3307': { id: '3307', name: 'Arch 1×6', category: '아치', w: 1, d: 6, plates: 3, shape: 'arch', studs: true },
};

// LDraw color code mapping to RGB values
const LDRAW_COLOR_MAP: Record<string, { r: number; g: number; b: number }> = {
  '0': { r: 0, g: 0, b: 0 },       // Black
  '1': { r: 7, g: 96, b: 233 },    // Blue
  '2': { r: 37, g: 122, b: 62 },   // Green
  '3': { r: 199, g: 83, b: 5 },    // Yellow
  '4': { r: 200, g: 16, b: 46 },   // Red
  '5': { r: 115, g: 41, b: 28 },   // Brown
  '6': { r: 128, g: 128, b: 128 }, // Grey
  '7': { r: 169, g: 169, b: 169 }, // Light Grey
  '8': { r: 242, g: 242, b: 242 }, // White
  '9': { r: 233, g: 59, b: 7 },    // Orange
  '10': { r: 11, g: 110, b: 61 },  // Dark Green
  '11': { r: 0, g: 0, b: 0 },      // Trans Black
  '12': { r: 7, g: 96, b: 233 },   // Trans Blue
  '13': { r: 199, g: 83, b: 5 },   // Trans Yellow
  '14': { r: 200, g: 16, b: 46 },  // Trans Red
  '15': { r: 233, g: 233, b: 233 }, // Trans White
  '27': { r: 187, g: 233, b: 11 },  // Lime
};

/**
 * Get LEGO part information by brick ID
 */
export function getLDrawPart(brickId: string): LDrawPart | null {
  return LEGO_PARTS[brickId] || null;
}

/**
 * Get RGB color values from LDraw color code
 */
export function getLDrawColor(colorCode: string): { r: number; g: number; b: number } {
  return LDRAW_COLOR_MAP[colorCode] || { r: 128, g: 128, b: 128 }; // Default to grey
}

/**
 * Convert RGB to hex color string
 */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.max(0, Math.min(255, x)).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

/**
 * Get hex color from LDraw color code
 */
export function getHexColor(colorCode: string): string {
  const { r, g, b } = getLDrawColor(colorCode);
  return rgbToHex(r, g, b);
}
