/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Tally3, 
  Wind, 
  Zap, 
  Volume2, 
  Maximize, 
  AlertCircle 
} from 'lucide-react';

export function Dashboard({ t, common }: { t: any, common: any }) {
  return (
    <div className="p-0 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max h-full overflow-y-auto pb-10 md:pb-0">
      <div className="md:col-span-2 bg-panel border-l-4 border-accent p-6 flex flex-col gap-3 rounded-r-lg">
        <div className="flex justify-between items-center">
          <span className="text-[10px] uppercase font-bold text-accent opacity-80 tracking-widest">{t.overview}</span>
          <span className="mono-value opacity-40 text-[10px]">440.0 Hz REF</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-ink italic">{t.subtitle}</h2>
        <p className="text-[13px] text-ink-faded leading-relaxed">
          {t.description}
        </p>
      </div>

      <MetricCard 
        label={t.ambient} 
        value="32.4" 
        unit="dB" 
        status="NORMAL" 
        icon={Volume2} 
      />
      <MetricCard 
        label={t.flux} 
        value="±0.2" 
        unit="mm" 
        status="WARNING" 
        icon={Tally3} 
      />
      <MetricCard 
        label={t.force} 
        value="142" 
        unit="g" 
        status="NORMAL" 
        icon={Zap} 
      />
      <MetricCard 
        label={t.humidity} 
        value="42" 
        unit="%" 
        status="OPTIMAL" 
        icon={Wind} 
      />

      <div className="md:col-span-2 p-0 mt-4">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent mb-4 px-1">{t.calibrations}</h3>
        <div className="space-y-3 pb-8">
          <CalibItem label={t.gyro} completed={false} actionText={t.actionReq} verifiedText={common.verified} />
          <CalibItem label={t.mic} completed={true} actionText={t.actionReq} verifiedText={common.verified} />
          <CalibItem label={t.optical} completed={false} actionText={t.actionReq} verifiedText={common.verified} />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, unit, status, icon: Icon }: any) {
  return (
    <div className="bg-panel border border-border p-5 flex flex-col gap-4 relative overflow-hidden rounded-lg">
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${status === 'WARNING' ? 'text-danger' : 'text-accent'}`} />
        <span className="text-[11px] uppercase tracking-widest text-ink-faded font-bold">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tighter text-ink font-mono">{value}</span>
        <span className="text-[11px] opacity-40 uppercase font-bold">{unit}</span>
      </div>
      <div className={`text-[10px] font-bold px-2 py-0.5 rounded border inline-block w-fit mt-1 ${
        status === 'NORMAL' ? 'border-success text-success bg-success/10' : 
        status === 'OPTIMAL' ? 'border-accent text-accent bg-accent/10' :
        'border-danger text-danger bg-danger/10'
      }`}>
        {status}
      </div>
    </div>
  );
}

function CalibItem({ label, completed, actionText, verifiedText }: { label: string; completed: boolean, actionText: string, verifiedText: string }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-md bg-surface-accent border border-border/20">
      <span className="text-sm text-ink-faded">{label}</span>
      {completed ? (
        <span className="text-[11px] text-success font-bold uppercase tracking-wider">{verifiedText}</span>
      ) : (
        <button className="text-[11px] text-accent font-bold uppercase tracking-widest hover:underline px-3 py-1 bg-accent/10 rounded-sm">{actionText}</button>
      )}
    </div>
  );
}
