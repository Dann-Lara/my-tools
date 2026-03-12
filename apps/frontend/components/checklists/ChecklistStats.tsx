'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useI18n } from '../../lib/i18n-context';
import { checklistsApi, type Checklist, type ProgressData } from '../../lib/checklists';
import { ProgressRing } from './ProgressRing';

interface ChecklistStatsProps {
  checklists: Checklist[];
}

export function ChecklistStats({ checklists }: ChecklistStatsProps) {
  const { t } = useI18n();
  const [progresses, setProgresses] = useState<Record<string, ProgressData>>({});

  useEffect(() => {
    if (!checklists.length) return;
    checklists.forEach((cl) => {
      checklistsApi
        .getProgress(cl.id)
        .then((p) => setProgresses((prev) => ({ ...prev, [cl.id]: p })))
        .catch(() => {});
    });
  }, [checklists]);

  const allItems = checklists.flatMap((cl) => cl.items ?? []);
  const totalTasks = allItems.length;
  const completedTasks = allItems.filter((i) => i.status === 'completed').length;
  const pendingTasks = allItems.filter((i) => i.status === 'pending').length;
  const globalPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeCount = checklists.filter((c) => c.status === 'active').length;
  const pausedCount = checklists.filter((c) => c.status === 'paused').length;
  const completedCount = checklists.filter((c) => c.status === 'completed').length;

  if (!checklists.length) return null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {
            label: 'Checklists',
            value: checklists.length,
            color: 'text-slate-800 dark:text-white',
          },
          {
            label: t.checklist.active,
            value: activeCount,
            color: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: t.checklist.paused,
            value: pausedCount,
            color: 'text-amber-600 dark:text-amber-400',
          },
          {
            label: t.checklist.completed,
            value: completedCount,
            color: 'text-sky-600 dark:text-sky-400',
          },
          {
            label: t.checklist.tasksCompleted,
            value: completedTasks,
            color: 'text-emerald-600 dark:text-emerald-400',
          },
          {
            label: t.checklist.tasksPending,
            value: pendingTasks,
            color: 'text-sky-600 dark:text-sky-400',
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
            <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">
              {label}
            </p>
          </div>
        ))}
      </div>

      <div className="card p-6 flex flex-col md:flex-row items-center gap-8">
        <div className="flex flex-col items-center gap-2">
          <ProgressRing
            value={globalPct}
            size={110}
            stroke={9}
            color={globalPct >= 80 ? '#34d399' : globalPct >= 40 ? '#38bdf8' : '#f59e0b'}
            label={t.dashboard.overallProgress}
          />
        </div>
        <div className="flex-1 w-full space-y-3">
          {checklists.map((cl) => {
            const p = progresses[cl.id];
            const pct = p
              ? p.completionRate
              : Math.round(
                  (cl.items.filter((i) => i.status === 'completed').length /
                    Math.max(cl.items.length, 1)) *
                    100,
                );
            return (
              <div key={cl.id}>
                <div className="flex items-center justify-between mb-1">
                  <Link
                    href={`/checklists/${cl.id}`}
                    className="font-mono text-[10px] text-slate-700 dark:text-slate-300 truncate max-w-[70%]
                               hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                  >
                    {cl.title}
                  </Link>
                  <span className="font-mono text-[9px] text-slate-400 shrink-0 ml-2">{pct}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 80 ? '#34d399' : pct >= 40 ? '#38bdf8' : '#f59e0b',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
