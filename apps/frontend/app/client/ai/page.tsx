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

export default function AiToolsPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth(['client', 'admin', 'superadmin']);
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
    <DashboardLayout variant="client" user={user} title="AI Tools">
      <PermissionGate module="ai">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
          <div ref={headerRef} className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-2">
              AI Tools
            </p>
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              AI Tools
            </h1>
            <p className="font-mono text-[12px] text-slate-400 mt-3">
              Genera texto y resume documentos con IA
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
              <AiGenerator />
            </div>
          )}

          {activeTab === 'summarizer' && (
            <div className="card p-6 space-y-4">
              <AiSummarizer />
            </div>
          )}
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
}
