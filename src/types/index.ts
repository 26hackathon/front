/**
 * Shared type definitions used across the application.
 * Add common types, interfaces, and enums here.
 */

export type ColorScheme = 'light' | 'dark';

// Brick data structure from JSON
export interface BrickData {
  brickId: string;
  colorCode: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
  rotation: {
    x: number;
    y: number;
    z: number;
  };
}

export interface AssemblyData {
  bricks: BrickData[];
}
