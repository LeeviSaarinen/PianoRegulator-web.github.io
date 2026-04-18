/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, CheckCircle2, Info, Activity } from 'lucide-react';
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

const SENSITIVITY_DATA = [
  { input: 2, force: 10 },
  { input: 10, force: 30 },
  { input: 20, force: 55 },
  { input: 30, force: 75 },
  { input: 40, force: 92 },
  { input: 50, force: 105 },
  { input: 60, force: 115 },
  { input: 70, force: 122 },
];

export function PhysicsModel({ t, common }: { t: any, common: any }) {
  return (
    <div className="flex flex-col h-full bg-background p-2 overflow-hidden gap-6">
      <header>
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block italic opacity-80">{t.subtitle}</span>
        <h2 className="text-2xl font-bold tracking-tighter text-ink italic">{t.title}</h2>
      </header>

      <div className="flex-1 flex flex-col gap-6 overflow-y-auto pb-10">
        {/* Dynamic Action Schematic (Abstract) */}
        <div className="bg-panel border border-border rounded-xl p-6 relative shadow-inner overflow-hidden min-h-[220px] flex items-center justify-center">
           {/* Abstract Lever Diagram - Responsive SVG */}
           <svg 
             viewBox="0 0 300 150" 
             className="opacity-90 w-full max-w-[320px] h-auto"
           >
             {/* Key Lever */}
             <motion.line 
               x1="50" y1="120" x2="250" y2="120" 
               stroke="var(--accent)" strokeWidth="4"
               animate={{ rotate: [0, -2, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
             />
             {/* Pivot */}
             <circle cx="150" cy="120" r="6" fill="var(--border)" />
             
             {/* Whippen/Hammer mechanism (Abstract) */}
             <motion.path 
               d="M 100 120 L 100 80 L 150 50" 
               stroke="#909296" strokeWidth="2" fill="none"
               animate={{ y: [0, -5, 0] }}
               transition={{ repeat: Infinity, duration: 2 }}
             />
             <motion.circle 
               cx="150" cy="50" r="12" fill="#E0A458"
               animate={{ x: [150, 155, 150], y: [50, 45, 50] }}
               transition={{ repeat: Infinity, duration: 2 }}
             />

             <text x="50" y="140" fontSize="10" fill="#909296" className="font-mono">Front Rail</text>
             <text x="220" y="140" fontSize="10" fill="#909296" className="font-mono">Back Check</text>
           </svg>
           
           <div className="absolute top-4 right-4 text-right">
              <div className="text-[10px] font-bold text-accent uppercase tracking-widest">{t.realtime}</div>
              <div className="text-[12px] font-mono text-ink">{t.ratio}: 1:5.2</div>
           </div>
        </div>

        {/* Action Issues / Diagnostics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <IssueCard 
             title={t.issues.friction.title} 
             description={t.issues.friction.desc}
             severity="HIGH"
           />
           <IssueCard 
             title={t.issues.spring.title} 
             description={t.issues.spring.desc}
             severity="MEDIUM"
           />
           <IssueCard 
              title={t.issues.timing.title} 
              description={t.issues.timing.desc}
              severity="MEDIUM"
           />
           <IssueCard 
              title={t.issues.stability.title} 
              description={t.issues.stability.desc}
              severity="OPTIMAL"
           />
        </div>

        {/* Force-Input Mapping */}
        <div className="bg-panel border border-border rounded-xl p-5 flex flex-col gap-4">
           <div className="flex justify-between items-center">
             <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.forceCurve}</h3>
             <span className="text-[10px] font-mono text-ink-faded uppercase">{t.nonLinear}</span>
           </div>
           
           <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={SENSITIVITY_DATA}>
                  <XAxis dataKey="input" hide />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1B1E', border: '1px solid #313238', fontSize: '10px' }}
                    itemStyle={{ color: '#E0A458' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="force" 
                    stroke="#E0A458" 
                    strokeWidth={3} 
                    dot={{ fill: '#E0A458', strokeWidth: 2 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
           </div>
           <p className="text-[11px] text-ink-faded italic leading-relaxed">
             {t.curveDesc}
           </p>
        </div>

        {/* Regulation Guide */}
        <div className="bg-surface-accent border border-border/30 rounded-xl p-6">
           <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4">{t.intelligence}</h3>
           <div className="space-y-4">
              {t.steps.map((step: any, idx: number) => (
                <RegulationStep 
                  key={idx}
                  num={(idx + 1).toString().padStart(2, '0')} 
                  task={step.task} 
                  detail={step.detail} 
                />
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}

function IssueCard({ title, description, severity }: { title: string, description: string, severity: 'HIGH' | 'MEDIUM' | 'OPTIMAL' }) {
  const Icon = severity === 'HIGH' ? AlertTriangle : severity === 'MEDIUM' ? Info : CheckCircle2;
  const color = severity === 'HIGH' ? 'text-danger' : severity === 'MEDIUM' ? 'text-accent' : 'text-success';
  const bgColor = severity === 'HIGH' ? 'bg-danger/5' : severity === 'MEDIUM' ? 'bg-accent/5' : 'bg-success/5';

  return (
    <div className={`p-4 border border-border/40 rounded-lg ${bgColor} flex gap-4 items-start shadow-sm transition-all hover:border-border`}>
      <Icon className={`w-5 h-5 shrink-0 ${color}`} />
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-ink">{title}</span>
        <p className="text-[11px] text-ink-faded leading-relaxed italic">{description}</p>
      </div>
    </div>
  );
}

function RegulationStep({ num, task, detail }: { num: string, task: string, detail: string }) {
  return (
    <div className="flex gap-4 items-start">
      <span className="text-xl font-mono font-bold text-accent/30 tracking-tighter leading-none">{num}</span>
      <div className="flex flex-col gap-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-ink">{task}</span>
        <p className="text-[11px] text-ink-faded leading-relaxed">{detail}</p>
      </div>
    </div>
  );
}
