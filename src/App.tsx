/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Shell } from './components/layout/Shell';
import { Dashboard } from './components/tools/Dashboard';
import { LevelDipTool } from './components/tools/LevelDipTool';
import { AcousticDiagnostics } from './components/tools/AcousticDiagnostics';
import { TimingSensor } from './components/tools/TimingSensor';
import { ActionCamera } from './components/tools/ActionCamera';
import { PhysicsModel } from './components/tools/PhysicsModel';
import { DataTable } from './components/tools/DataTable';
import { ToolType, Language } from './types';
import { TRANSLATIONS } from './translations';

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolType>('DASHBOARD');
  const [language, setLanguage] = useState<Language>('EN');

  const t = TRANSLATIONS[language];

  const renderTool = () => {
    switch (activeTool) {
      case 'DASHBOARD':
        return <Dashboard t={t.dashboard} common={t.common} />;
      case 'KEY_LEVEL':
      case 'KEY_DIP':
        return <LevelDipTool mode={activeTool} t={t.levelDip} sensorsT={t.sensors} />;
      case 'HAMMER_BLOW':
      case 'LETOFF':
        return <ActionCamera mode={activeTool} t={t.camera} />;
      case 'KEY_NOISE':
      case 'SOUNDBOARD':
        return <AcousticDiagnostics mode={activeTool} t={t.acoustic} />;
      case 'IMPACT_VELOCITY':
      case 'PEDAL_TIMING':
        return <TimingSensor mode={activeTool} t={t.timing} />;
      case 'PHYSICS_MODEL':
        return <PhysicsModel t={t.physics} common={t.common} />;
      case 'MEASUREMENT_DATA':
        return <DataTable t={t.data} common={t.common} />;
      default:
        return <Dashboard t={t.dashboard} common={t.common} />;
    }
  };

  return (
    <Shell 
      activeTool={activeTool} 
      onToolSelect={setActiveTool}
      language={language}
      onLanguageChange={setLanguage}
      t={t}
    >
      {renderTool()}
    </Shell>
  );
}
