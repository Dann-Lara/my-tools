'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '../../lib/i18n-context';
import { useAuth } from '../../hooks/useAuth';
import { DashboardLayout } from '../../components/ui/DashboardLayout';
import { ChecklistCard } from '../../components/checklists/ChecklistCard';
import { ChecklistStats } from '../../components/checklists/ChecklistStats';
import { EmptyState } from '../../components/checklists/EmptyState';
import { checklistsApi, type Checklist } from '../../lib/checklists';

const USER_ROLES = ['superadmin', 'admin', 'client'];

type TabType = 'all' | 'active' | 'paused' | 'completed' | 'global';

export default function ChecklistsListPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth(USER_ROLES);

  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const listRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await checklistsApi.list();
      setChecklists(data);
    } catch {
      /**/
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) void load();
  }, [authLoading, load]);

  useEffect(() => {
    if (loading || activeTab === 'global' || !listRef.current) return;
    const cards = listRef.current.querySelectorAll('.checklist-card');
    if (!cards.length) return;
    (async () => {
      const anime = (await import('animejs')).default;
      anime({
        targets: Array.from(cards),
        opacity: [0, 1],
        translateY: [16, 0],
        delay: anime.stagger(50),
        duration: 400,
        easing: 'easeOutExpo',
      });
    })();
  }, [loading, activeTab, checklists.length]);

  async function handleDelete(id: string) {
    await checklistsApi.delete(id);
    setChecklists((prev) => prev.filter((c) => c.id !== id));
  }

  const counts: Record<TabType, number> = {
    all: checklists.length,
    active: checklists.filter((c) => c.status === 'active').length,
    paused: checklists.filter((c) => c.status === 'paused').length,
    completed: checklists.filter((c) => c.status === 'completed').length,
    global: checklists.length,
  };

  const filtered =
    activeTab === 'all' || activeTab === 'global'
      ? checklists
      : checklists.filter((c) => c.status === activeTab);

  if (authLoading || !user) return null;

  return (
    <DashboardLayout
      variant={user.role === 'client' ? 'client' : 'admin'}
      user={user}
      title={t.nav.checklist}
    >
      <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
        <div className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p
              className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.4em] mb-3"
              suppressHydrationWarning
            >
              {t.checklist.headerSubtitle}
            </p>
            <h1
              className="headline text-5xl md:text-7xl text-slate-900 dark:text-white"
              suppressHydrationWarning
            >
              {t.checklist.myChecklists}
            </h1>
            {counts.active > 0 && (
              <p className="font-mono text-[11px] text-slate-500 mt-2">
                {counts.active} checklist{counts.active !== 1 ? 's' : ''}{' '}
                {t.checklist.active.toLowerCase()}
                {counts.active !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          <Link
            href="/checklists/new"
            className="btn-primary flex items-center gap-2 py-3 px-6 self-start"
            suppressHydrationWarning
          >
            <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 1.5L8 5.5l4 1-4 1-1 4-1-4-4-1 4-1 1-4z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
            {t.checklist.newChecklist}
          </Link>
        </div>

        <div className="flex gap-1 mb-8 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {(
            [
              { key: 'all', label: t.checklist.tabAll },
              { key: 'active', label: t.checklist.active },
              { key: 'paused', label: t.checklist.paused },
              { key: 'completed', label: t.checklist.completed },
              { key: 'global', label: t.checklist.globalDashboard },
            ] as { key: TabType; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`font-mono text-[10px] uppercase tracking-widest px-4 py-3 whitespace-nowrap
                          border-b-2 -mb-px transition-all shrink-0
                          ${
                            activeTab === key
                              ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                          }`}
            >
              {label}
              {key !== 'global' && counts[key] > 0 && (
                <span className="opacity-60 ml-1">({counts[key]})</span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle
                  cx="8"
                  cy="8"
                  r="6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeOpacity="0.2"
                />
                <path
                  d="M14 8a6 6 0 0 0-6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              {t.common.loading}
            </div>
          </div>
        ) : activeTab === 'global' ? (
          <ChecklistStats checklists={checklists} />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <div ref={listRef} className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((cl) => (
              <div key={cl.id} className="checklist-card" style={{ opacity: 0 }}>
                <ChecklistCard checklist={cl} onDelete={() => void handleDelete(cl.id)} />
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
