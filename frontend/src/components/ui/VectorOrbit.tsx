import React from 'react';

export const VectorOrbit: React.FC = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center wireframe-concentric pointer-events-none select-none overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-dotted-grid opacity-20 dark:opacity-10" />

      {/* SVG Canvas for Overlapping circles */}
      <svg className="w-full h-full absolute inset-0 opacity-40 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ring-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.05" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Concentric overlapping thin outlines */}
        <circle cx="50%" cy="50%" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="3 3" />
        <circle cx="50%" cy="50%" r="180" fill="none" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="50%" cy="50%" r="260" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="4 4" />
        <circle cx="50%" cy="50%" r="340" fill="none" stroke="currentColor" strokeWidth="0.5" />

        {/* Overlapping offset ripples */}
        <circle cx="35%" cy="50%" r="140" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="8 4" />
        <circle cx="65%" cy="50%" r="140" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="8 4" />
      </svg>

      {/* Interactive Core Orbital Node Group */}
      <div className="relative w-80 h-80 flex items-center justify-center">
        {/* Central Pulse Orbit */}
        <div className="absolute w-48 h-48 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-full animate-orbit" />

        {/* Orbit Node 1: Workspaces */}
        <div className="absolute left-[15%] top-[15%] flex flex-col items-center">
          <span className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-medium shadow-sm">
            Workspaces
          </span>
        </div>

        {/* Orbit Node 2: Channels */}
        <div className="absolute right-[10%] top-[35%] flex flex-col items-center">
          <span className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-medium shadow-sm">
            Channels
          </span>
        </div>

        {/* Orbit Node 3: Assignments */}
        <div className="absolute left-[35%] bottom-[5%] flex flex-col items-center">
          <span className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-medium shadow-sm">
            Assignments
          </span>
        </div>

        {/* Orbit Node 4: Resources */}
        <div className="absolute right-[25%] bottom-[20%] flex flex-col items-center">
          <span className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-xs font-medium shadow-sm">
            Resources
          </span>
        </div>

        {/* Central Hub Core */}
        <div className="relative z-10 w-24 h-24 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-full flex flex-col items-center justify-center p-2 text-center shadow-lg">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping absolute top-4" />
          <span className="text-[10px] tracking-widest text-emerald-500 font-bold uppercase mt-2">
            Realtime
          </span>
          <span className="text-xs font-semibold mt-1">
            Connected
          </span>
        </div>
      </div>
    </div>
  );
};
