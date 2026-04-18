/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SensorReading {
  timestamp: number;
  x: number;
  y: number;
  z: number;
}

export interface OrientationReading {
  timestamp: number;
  pitch: number;
  roll: number;
  yaw: number;
}

export interface SensorState {
  linearAcceleration: SensorReading;
  orientation: OrientationReading;
  gravity: SensorReading;
  rotationRate: { x: number; y: number; z: number; timestamp: number };
  isSupported: boolean;
  permissionGranted: boolean;
  api: 'generic' | 'legacy' | null;
}

const ALPHA = 0.8;

function quaternionToEuler(q: [number, number, number, number]): { pitch: number; roll: number; yaw: number } {
  const [x, y, z, w] = q;
  
  const sinr_cosp = 2 * (w * x + y * z);
  const cosr_cosp = 1 - 2 * (x * x + y * y);
  const roll = Math.atan2(sinr_cosp, cosr_cosp);

  const sinp = 2 * (w * y - z * x);
  const pitch = Math.abs(sinp) >= 1 ? Math.sign(sinp) * Math.PI / 2 : Math.asin(sinp);

  const siny_cosp = 2 * (w * z + x * y);
  const cosy_cosp = 1 - 2 * (y * y + z * z);
  const yaw = Math.atan2(siny_cosp, cosy_cosp);

  return {
    pitch: pitch * (180 / Math.PI),
    roll: roll * (180 / Math.PI),
    yaw: yaw * (180 / Math.PI)
  };
}

function lowPassFilter(previous: number, current: number, alpha: number = ALPHA): number {
  return previous * alpha + current * (1 - alpha);
}

async function requestGenericPermission(): Promise<boolean> {
  try {
    const result = await navigator.permissions.query({ name: 'accelerometer' as PermissionName });
    if (result.state === 'granted') return true;
    
    const absOrientation = new (window as any).AbsoluteOrientationSensor({ frequency: 60 });
    absOrientation.start();
    absOrientation.stop();
    return true;
  } catch {
    return false;
  }
}

async function requestLegacyPermission(): Promise<boolean> {
  if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
    try {
      const orientation = await (DeviceOrientationEvent as any).requestPermission();
      const motion = await (DeviceMotionEvent as any).requestPermission?.() ?? 'granted';
      return orientation === 'granted' && motion === 'granted';
    } catch {
      return false;
    }
  }
  return true;
}

export function useSensors() {
  const [state, setState] = useState<SensorState>({
    linearAcceleration: { timestamp: 0, x: 0, y: 0, z: 0 },
    orientation: { timestamp: 0, pitch: 0, roll: 0, yaw: 0 },
    gravity: { timestamp: 0, x: 0, y: 0, z: 0 },
    rotationRate: { x: 0, y: 0, z: 0, timestamp: 0 },
    isSupported: true,
    permissionGranted: false,
    api: null,
  });

  const calibrationOffset = useRef<OrientationReading>({ timestamp: 0, pitch: 0, roll: 0, yaw: 0 });
  const prevAccel = useRef({ x: 0, y: 0, z: 0 });
  const prevOrient = useRef({ pitch: 0, roll: 0, yaw: 0 });

  const sensorsRef = useRef<{
    accelerometer?: any;
    linearAccel?: any;
    gyroscope?: any;
    orientation?: any;
    gravity?: any;
  }>({});

  const requestPermission = useCallback(async () => {
    const hasGeneric = typeof (window as any).AbsoluteOrientationSensor !== 'undefined' ||
                     typeof (window as any).LinearAccelerationSensor !== 'undefined';

    if (hasGeneric) {
      const granted = await requestGenericPermission();
      if (granted) {
        setState(s => ({ ...s, permissionGranted: true, api: 'generic' }));
        return true;
      }
    }

    const legacyGranted = await requestLegacyPermission();
    setState(s => ({ ...s, permissionGranted: legacyGranted, api: legacyGranted ? 'legacy' : null }));
    return legacyGranted;
  }, []);

  const calibrate = useCallback(() => {
    calibrationOffset.current = {
      timestamp: performance.now(),
      pitch: prevOrient.current.pitch,
      roll: prevOrient.current.roll,
      yaw: prevOrient.current.yaw,
    };
  }, []);

  useEffect(() => {
    if (!state.permissionGranted || !state.api) return;

    const sensors = sensorsRef.current;
    const hasGeneric = state.api === 'generic';

    if (hasGeneric) {
      try {
        const GravitySensor = (window as any).GravitySensor;
        const Gyroscope = (window as any).Gyroscope;
        
        sensors.linearAccel = new (window as any).LinearAccelerationSensor({ frequency: 120 });
        sensors.orientation = new (window as any).AbsoluteOrientationSensor({ frequency: 120 });
        sensors.gravity = GravitySensor ? new GravitySensor({ frequency: 120 }) : undefined;
        sensors.gyroscope = Gyroscope ? new Gyroscope({ frequency: 120 }) : undefined;

        sensors.linearAccel.addEventListener('reading', () => {
          const now = performance.now() / 1000;
          const x = lowPassFilter(prevAccel.current.x, sensors.linearAccel.x);
          const y = lowPassFilter(prevAccel.current.y, sensors.linearAccel.y);
          const z = lowPassFilter(prevAccel.current.z, sensors.linearAccel.z);
          prevAccel.current = { x, y, z };

          setState(s => ({
            ...s,
            linearAcceleration: { timestamp: now, x, y, z }
          }));
        });

        sensors.orientation.addEventListener('reading', () => {
          const q: [number, number, number, number] = sensors.orientation.quaternion;
          if (!q) return;
          
          const euler = quaternionToEuler(q);
          const now = performance.now() / 1000;
          const pitch = lowPassFilter(prevOrient.current.pitch, euler.pitch);
          const roll = lowPassFilter(prevOrient.current.roll, euler.roll);
          const yaw = lowPassFilter(prevOrient.current.yaw, euler.yaw);
          prevOrient.current = { pitch, roll, yaw };

          setState(s => ({
            ...s,
            orientation: {
              timestamp: now,
              pitch: pitch - calibrationOffset.current.roll,
              roll: roll - calibrationOffset.current.pitch,
              yaw: yaw,
            }
          }));
        });

        sensors.gravity?.addEventListener('reading', () => {
          setState(s => ({
            ...s,
            gravity: {
              timestamp: performance.now() / 1000,
              x: sensors.gravity.x,
              y: sensors.gravity.y,
              z: sensors.gravity.z,
            }
          }));
        });

        sensors.gyroscope?.addEventListener('reading', () => {
          setState(s => ({
            ...s,
            rotationRate: {
              timestamp: performance.now() / 1000,
              x: sensors.gyroscope.x,
              y: sensors.gyroscope.y,
              z: sensors.gyroscope.z,
            }
          }));
        });

        Object.values(sensors).forEach(s => s?.start());
      } catch (err) {
        console.error('Generic sensor init error:', err);
        setState(s => ({ ...s, isSupported: false }));
      }
    } else {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        const beta = event.beta ?? 0;
        const gamma = event.gamma ?? 0;
        const alpha = event.alpha ?? 0;
        const now = performance.now() / 1000;

        const pitch = lowPassFilter(prevOrient.current.pitch, beta);
        const roll = lowPassFilter(prevOrient.current.roll, gamma);
        const yaw = lowPassFilter(prevOrient.current.yaw, alpha);
        prevOrient.current = { pitch, roll, yaw };

        setState(s => ({
          ...s,
          orientation: {
            timestamp: now,
            pitch: pitch - calibrationOffset.current.roll,
            roll: roll - calibrationOffset.current.pitch,
            yaw: (alpha - calibrationOffset.current.yaw + 360) % 360,
          }
        }));
      };

      const handleMotion = (event: DeviceMotionEvent) => {
        const acc = event.accelerationIncludingGravity;
        const rot = event.rotationRate;
        const now = performance.now() / 1000;

        if (acc) {
          const g = 9.80665;
          const x = lowPassFilter(prevAccel.current.x, (acc.x ?? 0));
          const y = lowPassFilter(prevAccel.current.y, (acc.y ?? 0));
          const z = lowPassFilter(prevAccel.current.z, (acc.z ?? 0));
          prevAccel.current = { x, y, z };

          setState(s => ({
            ...s,
            linearAcceleration: {
              timestamp: now,
              x: (x) * g,
              y: (y) * g,
              z: (z) * g,
            },
            gravity: {
              timestamp: now,
              x: acc.x ?? 0,
              y: acc.y ?? 0,
              z: acc.z ?? 0,
            }
          }));
        }

        if (rot) {
          setState(s => ({
            ...s,
            rotationRate: {
              timestamp: now,
              x: rot.alpha ?? 0,
              y: rot.beta ?? 0,
              z: rot.gamma ?? 0,
            }
          }));
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      window.addEventListener('devicemotion', handleMotion);

      return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        window.removeEventListener('devicemotion', handleMotion);
      };
    }
  }, [state.permissionGranted, state.api]);

  return { ...state, requestPermission, calibrate };
}