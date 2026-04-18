/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export function useAudioAnalyzer(isActive: boolean) {
  const [frequencyData, setFrequencyData] = useState<number[]>([]);
  const [peakFrequency, setPeakFrequency] = useState(0);
  const [rmsVolume, setRmsVolume] = useState(0);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);

  const startAnalyzer = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const context = new AudioCtx();
      audioContextRef.current = context;
      
      const source = context.createMediaStreamSource(stream);
      const analyzer = context.createAnalyser();
      analyzer.fftSize = 2048;
      source.connect(analyzer);
      analyzerRef.current = analyzer;

      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!analyzerRef.current) return;
        analyzerRef.current.getByteFrequencyData(dataArray);
        
        // Convert to array and downsample for UI performance
        const results: number[] = [];
        let maxVal = -1;
        let maxIndex = -1;

        for (let i = 0; i < bufferLength; i++) {
          results.push(dataArray[i]);
          if (dataArray[i] > maxVal) {
            maxVal = dataArray[i];
            maxIndex = i;
          }
        }

        // Calculate peak frequency
        const nyquist = context.sampleRate / 2;
        const peak = (maxIndex * nyquist) / bufferLength;
        
        // Calculate RMS Volume
        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += (dataArray[i] / 255) ** 2;
        }
        const rms = Math.sqrt(sum / bufferLength);

        // Limit state updates to avoid perf issues
        setFrequencyData([...results.slice(0, 128)]); // Store manageable slice
        setPeakFrequency(peak);
        setRmsVolume(rms);

        animationFrameRef.current = requestAnimationFrame(update);
      };

      update();
    } catch (err) {
      console.error('Audio analyzer error:', err);
    }
  }, []);

  const stopAnalyzer = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    audioContextRef.current = null;
    analyzerRef.current = null;
  }, []);

  useEffect(() => {
    if (isActive) {
      startAnalyzer();
    } else {
      stopAnalyzer();
    }
    return () => stopAnalyzer();
  }, [isActive, startAnalyzer, stopAnalyzer]);

  return { frequencyData, peakFrequency, rmsVolume };
}
