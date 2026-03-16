'use client';

import React from 'react';

interface Workflow {
  id: string;
  name: string;
  trigger: string;
  status: 'active' | 'ready';
  icon: React.ReactNode;
  color: string;
}

const workflows: Workflow[] = [
  { 
    id: 'reminders', 
    name: 'Checklist Reminders', 
    trigger: 'Every hour', 
    status: 'active', 
    color: 'sky',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    )
  },
  { 
    id: 'telegram', 
    name: 'Telegram Bot', 
    trigger: 'Webhook', 
    status: 'ready', 
    color: 'cyan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    )
  },
  { 
    id: 'feedback', 
    name: 'Weekly Feedback', 
    trigger: 'Sunday 20:00', 
    status: 'active', 
    color: 'emerald',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    )
  },
];

export function N8nShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {workflows.map((wf) => (
        <div 
          key={wf.id} 
          className="group p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-sky-400/50 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`w-12 h-12 rounded-lg bg-${wf.color}-500/10 flex items-center justify-center text-${wf.color}-500 group-hover:scale-110 transition-transform`}>
              {wf.icon}
            </div>
            <span className={`px-2 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider
              ${wf.status === 'active' 
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                : 'bg-slate-500/10 text-slate-500 border border-slate-500/20'
              }`}>
              {wf.status}
            </span>
          </div>
          
          <h3 className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100 mb-2">
            {wf.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] text-slate-500">
              {wf.trigger}
            </span>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-pink-500" />
              <span className="font-mono text-[9px] text-slate-400 uppercase tracking-wider">
                n8n workflow
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
