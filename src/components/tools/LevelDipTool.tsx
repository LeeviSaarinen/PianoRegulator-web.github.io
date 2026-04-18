/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { useSensors } from '../../hooks/useSensors';
import { Info, Gauge } from 'lucide-react';

import { ToolType } from '../../types';

interface LevelDipToolProps {
  mode?: ToolType;
  t: any;
  sensorsT: any;
}

export function LevelDipTool({ mode, t, sensorsT }: LevelDipToolProps) {
  const { 
    linearAcceleration, 
    orientation, 
    permissionGranted, 
    requestPermission, 
    calibrate, 
    api 
  } = useSensors();

  if (permissionGranted === null) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-6">
        <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
          <Info className="text-accent w-8 h-8" />
        </div>
        <div>
          <h2 className="text-lg font-bold mb-2">{sensorsT.required}</h2>
          <p className="text-sm text-ink-faded mb-6">
            {sensorsT.desc}
          </p>
          <button 
            onClick={requestPermission}
            className="w-full py-3 bg-accent text-white rounded-lg font-bold text-sm tracking-widest uppercase hover:bg-accent/90"
          >
            {sensorsT.grant}
          </button>
        </div>
      </div>
    );
  }

  const pitch = Math.min(Math.max(orientation.pitch, -90), 90);
  const roll = Math.min(Math.max(orientation.roll, -90), 90);

  return (
    <div className="flex flex-col h-full p-2 bg-background scanner overflow-hidden">
      <div className="flex-1 flex flex-col gap-6">
        <header>
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block italic opacity-80">
            {mode === 'KEY_LEVEL' ? t.leveling : mode === 'KEY_DIP' ? t.aftertouch : t.refAnalysis}
          </span>
          <h2 className="text-2xl font-bold tracking-tighter text-ink italic">{t.title}</h2>
        </header>

        {/* Visual Level */}
        <div className="flex-1 bg-panel border border-border rounded-xl relative flex items-center justify-center p-8 overflow-hidden shadow-inner">
          {/* Target Reticle */}
          <div className="absolute w-48 h-48 border border-accent/10 rounded-full" />
          <div className="absolute w-24 h-24 border border-accent/20 rounded-full" />
          <div className="absolute h-full w-[1px] bg-accent/5" />
          <div className="absolute w-full h-[1px] bg-accent/5" />

          {/* Dynamic Level Indicator */}
          <motion.div 
            animate={{ x: roll * 2, y: pitch * 2 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`w-14 h-14 rounded-full border flex items-center justify-center transition-all ${
              Math.abs(pitch) < 0.5 && Math.abs(roll) < 0.5 
              ? 'border-success bg-success/20 shadow-[0_0_30px_rgba(64,192,87,0.4)] scale-110' 
              : 'border-accent bg-accent/5 shadow-[0_0_15px_rgba(224,164,88,0.2)]'
            }`}
          >
             <div className="w-2 h-2 rounded-full bg-current" />
          </motion.div>

          <div className={`absolute top-4 left-4 flex flex-col gap-1 transition-opacity ${mode === 'KEY_LEVEL' ? 'opacity-30' : 'opacity-100'}`}>
             <span className={`text-[10px] uppercase font-bold tracking-wider ${mode === 'KEY_DIP' ? 'text-accent' : 'text-ink-faded'}`}>{t.dipAngle}</span>
             <span className="mono-value text-xl font-bold text-ink">{pitch.toFixed(1)}°</span>
          </div>
          <div className={`absolute top-4 right-4 flex flex-col items-end gap-1 transition-opacity ${mode === 'KEY_DIP' ? 'opacity-30' : 'opacity-100'}`}>
             <span className={`text-[10px] uppercase font-bold tracking-wider ${mode === 'KEY_LEVEL' ? 'text-accent' : 'text-ink-faded'}`}>{t.levelRoll}</span>
             <span className="mono-value text-xl font-bold text-ink">{roll.toFixed(1)}°</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-2 gap-4 pb-2">
           <button onClick={calibrate} className="bg-surface-accent border border-border p-4 flex flex-col items-center justify-center gap-1 hover:bg-accent/10 transition-colors rounded-lg group">
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink group-hover:text-accent">{t.zero}</span>
              <span className="text-[9px] text-ink-faded uppercase tracking-widest font-bold opacity-60">{t.reset}</span>
           </button>
           <button className="bg-surface-accent border border-border p-4 flex flex-col items-center justify-center gap-1 hover:bg-accent/10 transition-colors rounded-lg group">
              <span className="text-[11px] font-bold uppercase tracking-widest text-ink group-hover:text-accent">{t.capture}</span>
              <span className="text-[9px] text-ink-faded uppercase tracking-widest font-bold opacity-60">{t.save}</span>
           </button>
        </div>

        {/* API Indicator */}
        <div className="flex items-center justify-center gap-2 text-[10px] text-ink-faded">
          <Gauge className="w-3 h-3" />
          <span>Sensor API: {api ?? 'none'}</span>
        </div>

        <div className="bg-panel p-5 rounded-lg border border-border/50">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-accent mb-2">{t.procedure}</h3>
          <p className="text-[13px] leading-relaxed text-ink-faded italic">
            {t.procDesc}
          </p>
        </div>
      </div>
    </div>
  );
}
