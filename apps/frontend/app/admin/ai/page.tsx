'use client';

import { useState } from 'react';
import { useI18n } from '../../../lib/i18n-context';
import { useAuth } from '../../../hooks/useAuth';
import { useFadeInUp } from '../../../hooks/useAnime';
import { DashboardLayout } from '../../../components/ui/DashboardLayout';
import { PermissionGate } from '../../../components/ui/PermissionGate';
import { Spinner } from '../../../components/ui/Spinner';
import { AiGenerator } from '../../../components/ai/AiGenerator';
import { AiSummarizer } from '../../../components/ai/AiSummarizer';

const ADMIN_ROLES = ['superadmin', 'admin'];

export default function AiToolsPage() {
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth(ADMIN_ROLES);
  const [activeTab, setActiveTab] = useState<'generator' | 'summarizer'>('generator');
  const headerRef = useFadeInUp<HTMLDivElement>({ delay: 0, duration: 500 });

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner />
      </div>
    );
  }

  return (
    <DashboardLayout variant="admin" user={user} title={t.nav.ai}>
      <PermissionGate module="ai">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
          <div ref={headerRef} className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-2">
              {t.dashboard?.aiTools ?? 'AI Tools'}
            </p>
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.nav.ai ?? 'AI Tools'}
            </h1>
            <p className="font-mono text-[12px] text-slate-400 mt-3">
              {t.dashboard?.aiToolsDesc ?? 'Genera texto y resume documentos con IA'}
            </p>
          </div>

          <div className="flex items-center gap-0 mb-8 border-b border-slate-200 dark:border-slate-800">
            {([
              { key: 'generator' as const, label: t.dashboard?.generatorTitle ?? 'Generador de Texto' },
              { key: 'summarizer' as const, label: t.dashboard?.summarizerTitle ?? 'Resumidor' },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest shrink-0 -mb-px border-b-2 transition-all
                  ${activeTab === tab.key
                    ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'generator' && (
            <div className="card p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded border border-sky-200 dark:border-sky-500/20
                                  bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center
                                  text-sky-600 dark:text-sky-400">
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                      <path d="M7 1.5L8 5.5l4 1-4 1-1 4-1-4-4-1 4-1 1-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    {t.dashboard?.generatorTitle ?? 'Generador de Texto'}
                  </h3>
                </div>
                <p className="font-mono text-[11px] text-slate-500 leading-relaxed">
                  {t.dashboard?.generatorDesc ?? 'Genera texto personalizado usando IA'}
                </p>
              </div>
              <AiGenerator />
            </div>
          )}

          {activeTab === 'summarizer' && (
            <div className="card p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded border border-emerald-200 dark:border-emerald-500/20
                                  bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center
                                  text-emerald-600 dark:text-emerald-400">
                    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                      <path d="M2 10l3-3 2 2 5-6 2 2-7 5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
                    {t.dashboard?.summarizerTitle ?? 'Resumidor de Texto'}
                  </h3>
                </div>
                <p className="font-mono text-[11px] text-slate-500 leading-relaxed">
                  {t.dashboard?.summarizerDesc ?? 'Resume documentos largos en puntos clave'}
                </p>
              </div>
              <AiSummarizer />
            </div>
          )}
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
}
