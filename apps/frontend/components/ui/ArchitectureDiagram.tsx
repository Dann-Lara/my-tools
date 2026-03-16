'use client';

import React from 'react';

const nodes = [
  { id: 'user', label: 'Users', desc: 'Web & Mobile Apps' },
  { id: 'frontend', label: 'Next.js', desc: 'React Framework' },
  { id: 'backend', label: 'NestJS', desc: 'Node.js API' },
  { id: 'database', label: 'PostgreSQL', desc: 'Primary Database' },
  { id: 'redis', label: 'Redis', desc: 'Caching & Sessions' },
  { id: 'ai', label: 'AI Core', desc: 'Multi-Provider AI' },
  { id: 'n8n', label: 'n8n', desc: 'Workflow Automation' },
  { id: 'telegram', label: 'Telegram', desc: 'Notifications Bot' },
];

const flows = [
  ['user', 'frontend'],
  ['frontend', 'backend'],
  ['backend', 'database'],
  ['backend', 'redis'],
  ['backend', 'ai'],
  ['backend', 'n8n'],
  ['n8n', 'telegram'],
];

export function ArchitectureDiagram() {
  return (
    <div className="w-full">
      <div className="relative overflow-x-auto pb-8">
        <div className="flex items-center justify-start gap-3 min-w-max">
          {flows.map(([from, to], i) => (
            <React.Fragment key={i}>
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center gap-1 hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 group">
                  <div className="text-sky-500 group-hover:scale-110 transition-transform">
                    {getIcon(from)}
                  </div>
                  <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                    {getLabel(from)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center w-8 h-24">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-300 dark:text-slate-700">
                  <path d="M5 12h14M14 7l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </React.Fragment>
          ))}
          <div className="flex flex-col items-center">
            <div className="w-24 h-24 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 flex flex-col items-center justify-center gap-1 hover:border-sky-400/50 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-300 group">
              <div className="text-sky-500 group-hover:scale-110 transition-transform">
                {getIcon('telegram')}
              </div>
              <span className="font-mono text-[10px] text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Telegram
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Frontend', icon: 'frontend', items: ['Next.js 14', 'TypeScript', 'TailwindCSS'] },
          { title: 'Backend', icon: 'backend', items: ['NestJS', 'TypeORM', 'JWT Auth'] },
          { title: 'AI & Data', icon: 'ai', items: ['OpenAI', 'Groq', 'PostgreSQL'] },
          { title: 'Automation', icon: 'n8n', items: ['Workflows', 'Telegram Bot', 'Cron Jobs'] },
        ].map((cat) => (
          <div key={cat.title} className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sky-500">{getIcon(cat.icon)}</span>
              <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {cat.title}
              </span>
            </div>
            <ul className="space-y-1">
              {cat.items.map((item) => (
                <li key={item} className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function getIcon(id: string) {
  const icons: Record<string, React.ReactNode> = {
    user: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    frontend: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </svg>
    ),
    backend: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
    database: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    redis: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
        <path d="M12 6c-2.5 0-4.5 2-4.5 4.5 0 3.5 4.5 7.5 4.5 7.5s4.5-4 4.5-7.5C16.5 8 14.5 6 12 6z" />
        <circle cx="12" cy="11" r="1.5" fill="currentColor" />
      </svg>
    ),
    ai: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" />
        <circle cx="9" cy="13" r="1" fill="currentColor" />
        <circle cx="15" cy="13" r="1" fill="currentColor" />
      </svg>
    ),
    n8n: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <rect x="8" y="8" width="8" height="8" fill="currentColor" />
      </svg>
    ),
    telegram: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    ),
  };
  return icons[id] || null;
}

function getLabel(id: string): string {
  const labels: Record<string, string> = {
    user: 'Users',
    frontend: 'Frontend',
    backend: 'API',
    database: 'Database',
    redis: 'Redis',
    ai: 'AI',
    n8n: 'n8n',
    telegram: 'Telegram',
  };
  return labels[id] || id;
}
