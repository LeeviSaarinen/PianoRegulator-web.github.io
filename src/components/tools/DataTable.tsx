/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Download, 
  Filter, 
  Save, 
  FileText,
  ChevronRight,
  ChevronLeft,
  Check,
  RefreshCcw
} from 'lucide-react';

// Generate 88 piano keys: A0 to C8
const PIANO_KEYS = (() => {
  const result = [];
  result.push('A0', 'A#0', 'B0');
  for (let octave = 1; octave <= 7; octave++) {
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].forEach(note => {
      result.push(`${note}${octave}`);
    });
  }
  result.push('C8');
  return result;
})();

type KeyData = Record<string, string>;
type MasterData = Record<string, KeyData>;

export function DataTable({ t, common }: { t: any, common: any }) {
  const dynamicCols = [
    { id: 'level', label: t.cols.level, unit: 'mm' },
    { id: 'dip', label: t.cols.dip, unit: 'mm' },
    { id: 'blow', label: t.cols.blow, unit: 'mm' },
    { id: 'letoff', label: t.cols.letoff, unit: 'mm' },
    { id: 'drop', label: t.cols.drop, unit: 'mm' },
    { id: 'check', label: t.cols.check, unit: 'mm' },
    { id: 'velocity', label: t.cols.velocity, unit: 'm/s' },
  ];

  const [data, setData] = useState<MasterData>(() => {
    const initial: MasterData = {};
    PIANO_KEYS.forEach(key => {
      initial[key] = {
        level: (Math.random() * 0.4 - 0.2).toFixed(2),
        dip: (10 + (Math.random() * 0.4 - 0.2)).toFixed(1),
        blow: (47 + (Math.random() * 1 - 0.5)).toFixed(1),
        letoff: (1.5 + (Math.random() * 0.4 - 0.2)).toFixed(1),
        drop: (1.5 + (Math.random() * 0.4 - 0.2)).toFixed(1),
        check: (15 + (Math.random() * 1 - 0.5)).toFixed(1),
        velocity: (4.2 + (Math.random() * 0.5)).toFixed(1),
      };
    });
    return initial;
  });

  const [search, setSearch] = useState('');
  const [editingCell, setEditingCell] = useState<{ key: string, colId: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredKeys = PIANO_KEYS.filter(k => k.toLowerCase().includes(search.toLowerCase()));

  const handleStartEdit = (key: string, colId: string, currentVal: string) => {
    setEditingCell({ key, colId });
    setEditValue(currentVal);
  };

  const handleSaveEdit = () => {
    if (editingCell) {
      setData(prev => ({
        ...prev,
        [editingCell.key]: {
          ...prev[editingCell.key],
          [editingCell.colId]: editValue
        }
      }));
      setEditingCell(null);
    }
  };

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  return (
    <div className="flex flex-col h-full bg-background p-2 overflow-hidden gap-4">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent mb-1 block italic opacity-80">{t.subtitle}</span>
          <h2 className="text-2xl font-bold tracking-tighter text-ink italic">{t.title}</h2>
        </div>
        
        <div className="flex items-center gap-2">
           <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-faded" />
              <input 
                type="text" 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchKeys} 
                className="bg-panel border border-border/50 rounded-lg pl-9 pr-4 py-2 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-accent/50 w-full md:w-56 transition-all"
              />
           </div>
           <button className="p-2 border border-border bg-panel rounded-lg text-ink-faded hover:text-accent transition-colors" title="Export PDF">
              <FileText className="w-4 h-4" />
           </button>
           <button className="p-2 border border-border bg-panel rounded-lg text-ink-faded hover:text-accent transition-colors" title="Export CSV">
              <Download className="w-4 h-4" />
           </button>
           <button 
             onClick={() => window.location.reload()} 
             className="p-2 border border-border bg-panel rounded-lg text-ink-faded hover:text-accent transition-colors" 
             title="Reset Data"
           >
              <RefreshCcw className="w-4 h-4" />
           </button>
        </div>
      </header>

      {/* Matrix Table */}
      <div className="flex-1 bg-panel border border-border rounded-xl flex flex-col shadow-2xl relative overflow-hidden">
        {/* Table Container */}
        <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-border hover:scrollbar-thumb-accent/30 transition-colors">
          <table className="w-full text-left border-collapse isolate">
            <thead className="sticky top-0 z-20 bg-panel shadow-sm">
              <tr className="border-b border-border bg-surface-accent/80 backdrop-blur-md">
                <th className="sticky left-0 z-30 px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-accent bg-surface-accent border-r border-border min-w-[100px]">
                  {common.key}
                </th>
                {dynamicCols.map(col => (
                  <th key={col.id} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-accent/60 min-w-[120px]">
                    <div className="flex flex-col">
                      <span>{col.label}</span>
                      <span className="text-[9px] opacity-40 font-mono lowercase tracking-normal -mt-0.5">{col.unit}</span>
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-accent/60 text-right min-w-[100px]">
                  {common.status}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {filteredKeys.map((key) => (
                <tr 
                  key={key} 
                  className="hover:bg-surface-accent/30 transition-colors group h-12"
                >
                  <td className="sticky left-0 z-10 px-6 py-3 bg-panel group-hover:bg-surface-accent border-r border-border transition-colors">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${key.includes('#') ? 'bg-ink border border-border' : 'bg-white/80 shadow-[0_0_5px_rgba(255,255,255,0.3)]'}`} />
                      <span className="font-mono font-bold text-ink text-sm">{key}</span>
                    </div>
                  </td>
                  
                  {dynamicCols.map(col => {
                    const isEditing = editingCell?.key === key && editingCell?.colId === col.id;
                    const value = data[key][col.id];
                    
                    return (
                      <td 
                        key={col.id} 
                        className="px-6 py-3 cursor-pointer group/cell relative"
                        onClick={() => !isEditing && handleStartEdit(key, col.id, value)}
                      >
                        <div className="flex items-center justify-between">
                          {isEditing ? (
                            <input
                              ref={inputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleSaveEdit}
                              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
                              className="w-full bg-accent/10 border border-accent/40 rounded px-2 py-1 text-sm font-mono text-accent focus:outline-none ring-2 ring-accent/20"
                            />
                          ) : (
                            <>
                              <span className="font-mono text-sm text-ink-faded group-hover/cell:text-ink transition-colors">
                                {value}
                              </span>
                              <div className="opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                <div className="w-1 h-1 rounded-full bg-accent/40" />
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  <td className="px-6 py-3 text-right">
                    <StatusDot keyName={key} verifiedText={common.verified} adjustedText={common.adjusted} pendingText={common.pending} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-border bg-surface-accent/40 backdrop-blur-md flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-ink-faded">
          <span>{filteredKeys.length} {t.keysVisible}</span>
          <span className="text-accent/60 italic">{t.clickModify}</span>
        </div>
      </div>
    </div>
  );
}

function StatusDot({ keyName, verifiedText, adjustedText, pendingText }: { keyName: string, verifiedText: string, adjustedText: string, pendingText: string }) {
  // Simple deterministic status for demo
  const hash = keyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const status = hash % 3;
  
  if (status === 0) return (
    <div className="flex items-center justify-end gap-2 text-success opacity-80">
      <span className="text-[9px]">{verifiedText}</span>
      <div className="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(72,187,120,0.4)]" />
    </div>
  );
  
  if (status === 1) return (
    <div className="flex items-center justify-end gap-2 text-accent">
      <span className="text-[9px]">{adjustedText}</span>
      <div className="w-1.5 h-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(224,164,88,0.4)]" />
    </div>
  );

  return (
    <div className="flex items-center justify-end gap-2 text-ink-faded opacity-40">
      <span className="text-[9px]">{pendingText}</span>
      <div className="w-1.5 h-1.5 rounded-full bg-border" />
    </div>
  );
}
