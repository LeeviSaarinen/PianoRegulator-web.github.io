/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAudioAnalyzer } from '../../hooks/useAudioAnalyzer';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Play, Square, Settings2 } from 'lucide-react';

import { ToolType } from '../../types';

interface AcousticDiagnosticsProps {
  mode?: ToolType;
  t: any;
}

export function AcousticDiagnostics({ mode, t }: AcousticDiagnosticsProps) {
  const [isActive, setIsActive] = useState(false);
  const { frequencyData, peakFrequency, rmsVolume } = useAudioAnalyzer(isActive);

  const chartData = frequencyData.map((val, i) => ({
    freq: i * 200, // Simplification for visualization
    val
  }));

  return (
    <div className="flex flex-col h-full bg-background p-2 overflow-hidden">
      <header className="mb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block italic opacity-80">
          {mode === 'KEY_NOISE' ? t.noise : mode === 'SOUNDBOARD' ? t.resonance : t.analysis}
        </span>
        <h2 className="text-2xl font-bold tracking-tighter text-ink italic">{t.title}</h2>
      </header>

      <div className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* FFT Chart */}
        <div className="flex-[2] bg-panel border border-border rounded-xl p-2 relative shadow-inner">
          {!isActive && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/80 backdrop-blur-[2px]">
               <button 
                 onClick={() => setIsActive(true)}
                 className="flex items-center gap-2 px-6 py-2.5 bg-accent text-background rounded font-bold text-xs shadow-lg hover:opacity-90 transition-opacity"
               >
                 <Play className="w-4 h-4 fill-current" /> {t.capture.toUpperCase()}
               </button>
               <p className="text-[10px] mt-3 opacity-50 uppercase tracking-[0.2em] font-bold">Mic Input Required</p>
            </div>
          )}
          
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E0A458" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#E0A458" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="freq" hide />
              <YAxis hide domain={[0, 255]} />
              <Area 
                type="monotone" 
                dataKey="val" 
                stroke="#E0A458" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorVal)" 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Real-time Stats */}
        <div className="grid grid-cols-2 gap-4">
           <div className="bg-surface-accent border border-border p-4 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-ink-faded tracking-widest flex items-center gap-1.5 line-clamp-1">
                <div className="h-1.5 w-1.5 rounded-full bg-accent" />
                {t.resonance}
              </span>
              <div className="mono-value text-2xl font-bold text-ink mt-1 tracking-tighter">{peakFrequency.toFixed(1)} <span className="text-[11px] opacity-40 uppercase font-bold tracking-normal">Hz</span></div>
           </div>
           <div className="bg-surface-accent border border-border p-4 rounded-lg">
              <span className="text-[10px] uppercase font-bold text-ink-faded tracking-widest flex items-center gap-1.5 line-clamp-1">
                <div className="h-1.5 w-1.5 rounded-full bg-success" />
                {t.noiseFloor}
              </span>
              <div className="mono-value text-2xl font-bold text-ink mt-1 tracking-tighter">{(rmsVolume * 100).toFixed(1)} <span className="text-[11px] opacity-40 uppercase font-bold tracking-normal">dBfs</span></div>
           </div>
        </div>

        {/* Diagnostics List */}
        <div className="flex-1 bg-surface-accent border border-border/30 rounded-xl p-5 flex flex-col gap-3 overflow-y-auto">
           <h3 className="section-title text-accent opacity-90">{t.analysis}</h3>
           
           <div className="space-y-1">
             <AnomalyItem label="Action Friction Noise" confidence={82} severity="LOW" />
             <AnomalyItem label="Soundboard Integrity" confidence={98} severity="OPTIMAL" />
             <AnomalyItem label="Dampener Buzz Detection" confidence={12} severity="NONE" />
           </div>
        </div>

        {/* Controls */}
        <div className="flex gap-4 pb-2">
           <button 
             onClick={() => setIsActive(!isActive)}
             className={`flex-1 flex flex-col items-center justify-center p-4 rounded-lg border font-bold uppercase tracking-widest text-[10px] transition-all hover:bg-opacity-80 shadow-md ${isActive ? 'bg-danger border-danger text-white' : 'bg-surface-accent border-border text-ink'}`}
           >
              {isActive ? <Square className="w-5 h-5 mb-1.5 fill-current" /> : <Play className="w-5 h-5 mb-1.5 fill-current" />}
              {isActive ? "STOP" : t.intelligence.toUpperCase()}
           </button>
           <button className="flex-1 flex flex-col items-center justify-center p-4 rounded-lg border border-border bg-surface-accent text-ink-faded uppercase font-bold text-[10px] tracking-widest hover:bg-opacity-80 shadow-md transition-all">
              <Settings2 className="w-5 h-5 mb-1.5" />
              Tune Filters
           </button>
        </div>
      </div>
    </div>
  );
}

function AnomalyItem({ label, confidence, severity }: any) {
  const sevColor = severity === 'LOW' ? 'text-yellow-500' : severity === 'OPTIMAL' ? 'text-success' : 'text-ink-faded opacity-40';
  return (
    <div className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
      <div>
        <div className="text-xs font-mono">{label}</div>
        <div className="label-micro opacity-40">Confidence: {confidence}%</div>
      </div>
      <div className={`text-[10px] font-bold ${sevColor}`}>{severity}</div>
    </div>
  );
}
