/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Camera, RefreshCw, Layers } from 'lucide-react';

import { ToolType } from '../../types';

interface ActionCameraProps {
  mode?: ToolType;
  t: any;
}

export function ActionCamera({ mode, t }: ActionCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isFront, setIsFront] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isFront ? 'user' : 'environment' },
        audio: false
      });
      setStream(newStream);
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
    }
  }, [isFront, stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, [isFront]);

  return (
    <div className="flex flex-col h-full bg-black relative rounded-xl overflow-hidden border border-border">
      {/* Video Stream */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        className="flex-1 object-cover w-full h-full grayscale brightness-50 contrast-125 saturate-50"
      />

      {/* OCR/Vision UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col p-6">
        <div className="flex justify-between items-start">
           <div className="text-[10px] font-bold tracking-widest text-accent uppercase bg-background/40 backdrop-blur-sm px-2 py-1 rounded">Action Optics v2.4</div>
           <div className="text-[10px] font-mono text-ink bg-background/40 backdrop-blur-sm px-2 py-1 rounded">SYS: ACTIVE [440Hz]</div>
        </div>

        {/* Central Guides */}
        <div className="flex-1 flex flex-col items-center justify-center gap-24">
           {/* Hammer Blow Line */}
           <div className={`w-full relative transition-opacity ${mode === 'LETOFF' ? 'opacity-20' : 'opacity-100'}`}>
              <div className="absolute left-0 right-0 h-[1px] bg-danger/50 shadow-[0_0_10px_rgba(250,82,82,0.4)]" />
              <div className="absolute -top-5 left-4 text-[9px] font-bold uppercase tracking-widest text-danger">{t.blow} (45mm)</div>
           </div>

           {/* Let-off Target Zone */}
           <div className={`w-56 h-14 border border-dashed border-accent/40 rounded flex items-center justify-center bg-accent/5 transition-opacity ${mode === 'HAMMER_BLOW' ? 'opacity-20' : 'opacity-100'}`}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-accent/60">{t.letoff} (3mm)</div>
           </div>

           {/* Bedding Guide */}
           <div className="w-full relative">
              <div className="absolute left-0 right-0 h-[1px] bg-success/40 shadow-[0_0_10px_rgba(64,192,87,0.3)]" />
              <div className="absolute -top-5 right-4 text-[9px] font-bold uppercase tracking-widest text-success">Keybed Datum</div>
           </div>
        </div>

        {/* Vision Processing Indicators */}
        <div className="mt-auto grid grid-cols-2 gap-6 pb-8">
           <div className="p-4 bg-background/60 border border-border/50 backdrop-blur-md rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faded">Edge Detection</span>
              <div className="w-full h-1 bg-border rounded-full mt-3 overflow-hidden">
                 <div className="w-[85%] h-full bg-accent shadow-[0_0_10px_rgba(224,164,88,0.5)]" />
              </div>
           </div>
           <div className="p-4 bg-background/60 border border-border/50 backdrop-blur-md rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-widest text-ink-faded">Calibration Scale</span>
              <div className="mono-value text-xs mt-1.5 text-ink font-bold group">Ref: <span className="text-accent underline underline-offset-2">1.02:1.0</span></div>
           </div>
        </div>
      </div>

      {/* Floating Controls */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4">
         <button 
           onClick={() => setIsFront(!isFront)}
           className="p-3 rounded-full bg-panel/80 border border-border/50 text-white backdrop-blur-md"
         >
            <RefreshCw className="w-5 h-5" />
         </button>
         <button className="p-3 rounded-full bg-panel/80 border border-border/50 text-white backdrop-blur-md">
            <Layers className="w-5 h-5" />
         </button>
         <button className="p-3 rounded-full bg-accent border border-white/20 text-white shadow-lg">
            <Camera className="w-5 h-5" />
         </button>
      </div>
      
      {/* Horizontal Ruler Overlay (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-panel/40 backdrop-blur-sm border-t border-border/50 flex items-center px-2">
         <div className="flex-1 flex justify-between px-4">
            {[0,1,2,3,4,5,6,7,8,9,10].map(i => (
              <div key={i} className="flex flex-col items-center">
                <div className={`w-[1px] bg-ink/30 ${i % 5 === 0 ? 'h-3' : 'h-1.5'}`} />
              </div>
            ))}
         </div>
      </div>
    </div>
  );
}
