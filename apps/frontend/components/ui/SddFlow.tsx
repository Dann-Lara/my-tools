'use client';

import React from 'react';

interface SddStep {
  id: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

const steps: SddStep[] = [
  { 
    id: 'draft', 
    title: 'Draft', 
    desc: 'Create spec document', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    )
  },
  { 
    id: 'approved', 
    title: 'Approved', 
    desc: 'Stakeholder review', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    )
  },
  { 
    id: 'tasks', 
    title: 'Tasks', 
    desc: 'Break into tasks', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="9" y1="9" x2="15" y2="9" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="12" y2="17" />
      </svg>
    )
  },
  { 
    id: 'impl', 
    title: 'Impl', 
    desc: 'Implementation', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    )
  },
  { 
    id: 'done', 
    title: 'Done', 
    desc: 'Verified & shipped', 
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
];

export function SddFlow() {
  return (
    <div className="w-full">
      <div className="flex items-center justify-start gap-2 md:gap-4 overflow-x-auto pb-8">
        {steps.map((step, i) => (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center min-w-[100px] md:min-w-auto">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 border-sky-500/30 bg-slate-900/80 dark:bg-slate-900/60 flex items-center justify-center backdrop-blur-sm transition-all hover:border-sky-400 hover:shadow-lg hover:shadow-sky-500/20 group">
                <div className="text-sky-400 group-hover:scale-110 transition-transform">
                  {step.icon}
                </div>
              </div>
              <div className="mt-3 text-center">
                <div className="font-mono text-xs font-bold uppercase tracking-wider text-sky-400">
                  {step.title}
                </div>
                <div className="font-mono text-[9px] text-slate-500 mt-1">
                  {step.desc}
                </div>
              </div>
            </div>

            {i < steps.length - 1 && (
              <div className="hidden md:block w-8 md:w-16 h-0.5 bg-sky-500/30 mx-1 md:mx-4 rounded-full shrink-0">
                <div className="w-full h-full bg-gradient-to-r from-sky-400 to-cyan-400 rounded-full opacity-50" />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="mt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-emerald-400">
            <polyline points="23 4 23 10 17 10" />
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
          </svg>
          <span className="font-mono text-[10px] text-emerald-400/80">
            Feedback loop: iterate and improve
          </span>
        </div>
      </div>
    </div>
  );
}
