/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useSensors } from '../../hooks/useSensors';
import { Clock, Zap, History, Gauge } from 'lucide-react';
import { motion } from 'motion/react';

import { ToolType } from '../../types';

const IMPACT_THRESHOLD = 8;
const DEBOUNCE_MS = 150;

interface TimingSensorProps {
  mode?: ToolType;
  t: any;
}

export function TimingSensor({ mode, t }: TimingSensorProps) {
  const { linearAcceleration, permissionGranted, requestPermission, api } = useSensors();
  const [impacts, setImpacts] = useState<any[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const lastImpactTime = useRef(0);

  useEffect(() => {
    if (!isMonitoring) return;
    
    const magnitude = Math.sqrt(
      linearAcceleration.x ** 2 + 
      linearAcceleration.y ** 2 + 
      linearAcceleration.z ** 2
    );
    const now = Date.now();
    
    if (magnitude > IMPACT_THRESHOLD && now - lastImpactTime.current > DEBOUNCE_MS) {
      lastImpactTime.current = now;
      setImpacts(prev => [
        { time: new Date().toLocaleTimeString(), force: magnitude.toFixed(1), timestamp: now },
        ...prev.slice(0, 4)
      ]);
    }
  }, [linearAcceleration, isMonitoring]);

  return (
    <div className="flex flex-col h-full bg-background p-2">
      <header className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block italic opacity-80">
          {mode === 'IMPACT_VELOCITY' ? t.velocity : mode === 'PEDAL_TIMING' ? t.efficiency : t.engagement}
        </span>
        <h2 className="text-2xl font-bold tracking-tighter text-ink italic">{t.title}</h2>
      </header>

      <div className="flex-1 flex flex-col gap-6">
        {/* Sensor Visualizer */}
        <div className="h-48 bg-panel border border-border rounded-xl relative flex items-center justify-center p-8 overflow-hidden shadow-inner">
           {/* Accelerometer Waves */}
           <div className="absolute inset-0 flex items-center justify-around px-8 opacity-20">
              <motion.div 
                animate={{ height: Math.abs(linearAcceleration.x) * 10 }} 
                className="w-4 bg-accent rounded-t"
              />
              <motion.div 
                animate={{ height: Math.abs(linearAcceleration.y) * 10 }} 
                className="w-4 bg-success rounded-t"
              />
              <motion.div 
                animate={{ height: Math.abs(linearAcceleration.z) * 10 }} 
                className="w-4 bg-danger rounded-t"
              />
           </div>

           <div className="z-10 flex flex-col items-center">
              <div className="text-5xl font-mono font-bold tracking-tighter text-ink group">
                {Math.sqrt(linearAcceleration.x ** 2 + linearAcceleration.y ** 2 + linearAcceleration.z ** 2).toFixed(2)}
              </div>
              <span className="text-[10px] uppercase font-bold text-ink-faded tracking-widest mt-1">m/s² Magnitude</span>
           </div>
        </div>

        {/* Start/Stop Button */}
        <button 
          onClick={() => {
            if (!permissionGranted) requestPermission();
            setIsMonitoring(!isMonitoring);
          }}
          className={`w-full py-4 rounded-lg border font-bold uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 shadow-md ${
            isMonitoring 
            ? 'bg-danger border-danger text-white shadow-[0_0_20px_rgba(250,82,82,0.2)]' 
            : 'bg-surface-accent border-border text-accent hover:bg-accent/5'
          }`}
        >
          {isMonitoring ? <Zap className="w-4 h-4 animate-pulse fill-current" /> : <Clock className="w-4 h-4" />}
          {isMonitoring ? "Pulse Monitoring Active" : "Initiate Timing Mode"}
        </button>

        {/* History List */}
        <div className="flex-1 bg-surface-accent border border-border/30 rounded-xl p-5 flex flex-col gap-4">
           <h3 className="section-title text-accent opacity-90 flex items-center gap-2">
             <History className="w-3.5 h-3.5" /> {t.impact}
           </h3>
           <div className="space-y-2.5">
              {impacts.length === 0 ? (
                <div className="text-xs text-ink-faded opacity-30 italic p-6 text-center border border-dashed border-border/50 rounded-lg">Awaiting physical impact trigger...</div>
              ) : (
                impacts.map((imp, idx) => (
                  <motion.div 
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    key={imp.timestamp} 
                    className="flex justify-between items-center p-3.5 rounded-md bg-panel/50 border border-border/20 shadow-sm"
                  >
                    <span className="text-[11px] font-mono font-bold text-ink-faded">{imp.time}</span>
                    <span className="text-[11px] font-mono font-bold text-accent">MAG: {imp.force} m/s²</span>
                  </motion.div>
                ))
              )}
           </div>
        </div>

        <div className="p-4 bg-panel rounded-lg border border-border/50">
          <h4 className="text-[10px] font-bold text-success uppercase tracking-widest mb-2">Usage Protocol</h4>
          <p className="text-[12px] text-ink-faded leading-relaxed italic">
            {t.desc}
          </p>
        </div>

        {/* API Indicator */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-ink-faded">
          <Gauge className="w-3 h-3" />
          <span>Sensor API: {api ?? 'none'} | Threshold: {IMPACT_THRESHOLD} m/s²</span>
        </div>
      </div>
    </div>
  );
}
