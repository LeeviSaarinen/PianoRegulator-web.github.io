/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Language = 'EN' | 'FI';

export type ToolType = 
  | 'DASHBOARD'
  | 'KEY_LEVEL'
  | 'KEY_DIP'
  | 'HAMMER_BLOW'
  | 'LETOFF'
  | 'KEY_NOISE'
  | 'IMPACT_VELOCITY'
  | 'PEDAL_TIMING'
  | 'SOUNDBOARD'
  | 'PHYSICS_MODEL'
  | 'MEASUREMENT_DATA';

export interface SensorData {
  x: number;
  y: number;
  z: number;
  pitch: number;
  roll: number;
  yaw?: number;
  api?: 'generic' | 'legacy' | null;
}

export interface AcousticResult {
  frequency: number;
  decibels: number;
  spectrum: { freq: number; value: number }[];
}
