/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Ruler,
  ArrowDownToLine,
  MousePointer2,
  Hammer,
  Waves,
  Zap,
  Clock8,
  Disc3,
  Activity,
  Database,
  Menu,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ToolType, Language } from '../../types';
import { Globe } from 'lucide-react';

interface ShellProps {
  children: React.ReactNode;
  activeTool: ToolType;
  onToolSelect: (tool: ToolType) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  t: any;
}

const NAV_ITEMS = [
  { id: 'DASHBOARD', icon: LayoutDashboard },
  { id: 'KEY_LEVEL', icon: Ruler },
  { id: 'KEY_DIP', icon: ArrowDownToLine },
  { id: 'HAMMER_BLOW', icon: Hammer },
  { id: 'LETOFF', icon: MousePointer2 },
  { id: 'KEY_NOISE', icon: Waves },
  { id: 'SOUNDBOARD', icon: Disc3 },
  { id: 'IMPACT_VELOCITY', icon: Zap },
  { id: 'PEDAL_TIMING', icon: Clock8 },
  { id: 'PHYSICS_MODEL', icon: Activity },
  { id: 'MEASUREMENT_DATA', icon: Database },
] as const;

const PRIMARY_NAV = NAV_ITEMS.filter(item => item.id !== 'PHYSICS_MODEL' && item.id !== 'MEASUREMENT_DATA');
const SECONDARY_NAV = NAV_ITEMS.filter(item => item.id === 'PHYSICS_MODEL' || item.id === 'MEASUREMENT_DATA');

export function Shell({ children, activeTool, onToolSelect, language, onLanguageChange, t }: ShellProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStatsExpanded, setIsStatsExpanded] = useState(false);

  const activeLabel = t.nav[activeTool] || t.common.tool;

  const NavButton = ({ item, isMobile = false }: { item: typeof NAV_ITEMS[number], isMobile?: boolean }) => {
    const isActive = activeTool === item.id;
    const label = t.nav[item.id];

    if (isMobile) {
      return (
        <button
          key={item.id}
          onClick={() => {
            onToolSelect(item.id as ToolType);
            setIsMenuOpen(false);
          }}
          className={`px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
            isActive ? 'bg-accent/10 text-accent border border-accent/20' : 'text-ink-faded hover:bg-surface-accent/30'
          }`}
        >
          <item.icon className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
        </button>
      );
    }

    return (
      <button
        key={item.id}
        onClick={() => onToolSelect(item.id as ToolType)}
        className={`w-full px-4 py-3 flex items-center transition-all shrink-0 text-left relative group ${
          isActive ? 'bg-surface-accent text-accent' : 'text-ink-faded hover:text-ink hover:bg-surface-accent/30'
        }`}
      >
        {isActive && (
          <motion.div 
            layoutId="active-indicator"
            className="absolute left-0 w-[2px] h-full bg-accent"
          />
        )}
        <span className="text-[10px] font-bold uppercase tracking-[0.15em] transition-transform duration-200 group-hover:translate-x-0.5">
          {label}
        </span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-background text-ink overflow-hidden font-sans">
      {/* Header */}
      <header className="h-[60px] px-4 md:px-6 flex items-center justify-between border-b border-border bg-panel z-[100] shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden p-2 -ml-2 text-ink-faded hover:text-accent transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-bold tracking-widest uppercase text-accent leading-none">RegulaPiano Pro</span>
            <span className="text-[12px] font-bold text-ink-faded md:hidden uppercase tracking-wider">{activeLabel}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* Desktop Status Indicators */}
          <div className="hidden lg:flex items-center gap-5 border-r border-border pr-6">
            <StatusPill label="CAM" status="OK" />
            <StatusPill label="MIC" status="48kHz" />
            <StatusPill label="GYRO" status="STABLE" />
          </div>

          {/* Language Switcher */}
          <div className="flex items-center bg-surface-accent rounded-full p-1 border border-border/50">
            <button 
              onClick={() => onLanguageChange('EN')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${language === 'EN' ? 'bg-accent text-background' : 'text-ink-faded hover:text-ink'}`}
            >
              EN
            </button>
            <button 
              onClick={() => onLanguageChange('FI')}
              className={`px-3 py-1 rounded-full text-[10px] font-bold transition-all ${language === 'FI' ? 'bg-accent text-background' : 'text-ink-faded hover:text-ink'}`}
            >
              FI
            </button>
          </div>

          {/* Mobile Stat Toggle */}
          <button 
            onClick={() => setIsStatsExpanded(!isStatsExpanded)}
            className="md:hidden p-2 text-accent"
          >
            {isStatsExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Mobile Navigation Sidebar/Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMenuOpen(false)}
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] md:hidden"
              />
              <motion.nav 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed top-0 bottom-0 left-0 w-64 bg-panel border-r border-border z-[120] flex flex-col p-4 md:hidden"
              >
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-bold tracking-widest uppercase text-accent">MENU</span>
                  <button onClick={() => setIsMenuOpen(false)} className="text-ink-faded">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-col gap-1 overflow-y-auto">
                  <div className="flex flex-col gap-1">
                    {PRIMARY_NAV.map((item) => <NavButton key={item.id} item={item} isMobile />)}
                  </div>
                  <div className="my-4 border-t border-border/20" />
                  <div className="flex flex-col gap-1">
                    {SECONDARY_NAV.map((item) => <NavButton key={item.id} item={item} isMobile />)}
                  </div>
                </div>
              </motion.nav>
            </>
          )}
        </AnimatePresence>

        {/* Desktop Sidebar Nav */}
        <nav className="hidden md:flex w-24 border-r border-border flex-col py-4 bg-background shrink-0">
          <div className="flex flex-col overflow-y-auto flex-1">
            {PRIMARY_NAV.map((item) => <NavButton key={item.id} item={item} />)}
          </div>
          <div className="mt-auto flex flex-col pt-4 border-t border-border/10">
            {SECONDARY_NAV.map((item) => <NavButton key={item.id} item={item} />)}
          </div>
        </nav>

        {/* Viewport - Central Area */}
        <div className="flex-1 flex flex-col p-4 md:p-6 gap-4 md:gap-6 overflow-hidden bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTool}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex-1 overflow-hidden"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Data Panel / Mobile Bottom Sheet */}
        <aside className={`
          md:w-[300px] md:border-l border-border bg-panel flex flex-col overflow-hidden shrink-0 transition-all duration-300
          fixed bottom-0 left-0 right-0 z-[90] md:relative
          ${isStatsExpanded ? 'h-[60vh] border-t' : 'h-0 md:h-full border-0'}
        `}>
          <div className="p-6 flex flex-col gap-6 overflow-y-auto h-full">
            <div>
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent/60 mb-4">{t.telemetry.title}</h3>
              <div className="grid grid-cols-1 gap-3">
                <StatItem label={t.data.cols.level} value="+0.12" unit="mm" diff="-0.38" />
                <StatItem label={t.data.cols.blow} value="47.0" unit="mm" diff="REF OK" />
                <StatItem label={t.data.cols.letoff} value="1.6" unit="mm" diff="+0.1" isPositive />
              </div>
            </div>

            <div>
               <h3 className="text-[10px] font-bold uppercase tracking-widest text-accent/60 mb-4">{t.telemetry.pedal}</h3>
               <div className="grid grid-cols-1 gap-3">
                 <StatItem label={t.telemetry.engagement} value="120" unit="ms" />
                 <StatItem label={t.telemetry.travel} value="22.4" unit="mm" />
               </div>
            </div>

            <button className="mt-auto w-full py-4 bg-accent text-background rounded-lg font-bold uppercase tracking-widest text-[10px] hover:opacity-90 transition-opacity shadow-lg">
              {t.common.capture}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

function StatusPill({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center gap-1.5 font-mono text-[10px] text-ink-faded uppercase font-bold tracking-wider">
      <div className="h-1.5 w-1.5 rounded-full bg-success shadow-[0_0_5px_rgba(64,192,87,0.5)]" />
      <span>{label}: {status}</span>
    </div>
  );
}

function StatItem({ label, value, unit, diff, isPositive }: { label: string; value: string; unit: string; diff?: string; isPositive?: boolean }) {
  return (
    <div className="p-4 bg-surface-accent border border-border/20 rounded-lg flex items-center justify-between shadow-sm">
      <span className="text-[11px] font-bold uppercase tracking-widest text-ink-faded">{label}</span>
      <div className="text-right">
        <div className="font-mono font-bold text-ink text-base tracking-tighter">{value}<span className="text-[10px] ml-0.5 opacity-50 uppercase tracking-normal">{unit}</span></div>
        {diff && (
          <div className={`text-[10px] font-bold mt-0.5 ${diff === 'REF OK' ? 'opacity-30' : isPositive ? 'text-success' : 'text-danger'}`}>
             {diff} {diff !== 'REF OK' && 'MM'}
          </div>
        )}
      </div>
    </div>
  );
}
