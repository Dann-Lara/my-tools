'use client';

import Link from 'next/link';
import { useI18n } from '../../lib/i18n-context';

interface EmptyStateProps {
  variant?: 'default' | 'dashboard';
}

export function EmptyState({ variant = 'default' }: EmptyStateProps) {
  const { t } = useI18n();

  if (variant === 'dashboard') {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <div
          className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800
                          flex items-center justify-center text-slate-300 dark:text-slate-700"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 14l6 6 14-14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="font-mono text-[11px] text-slate-400" suppressHydrationWarning>
          {t.dashboard.noChecklistsYet}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 gap-6">
      <div
        className="w-20 h-20 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800
                        flex items-center justify-center text-slate-200 dark:text-slate-800"
      >
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <path
            d="M6 16l7 7 13-13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="text-center">
        <p
          className="headline text-3xl text-slate-900 dark:text-white mb-2"
          suppressHydrationWarning
        >
          {t.checklist.noChecklists}
        </p>
        <p className="font-mono text-[11px] text-slate-400 mb-6" suppressHydrationWarning>
          {t.checklist.createFirst}
        </p>
        <Link href="/checklists/new" className="btn-primary" suppressHydrationWarning>
          {t.checklist.newChecklist}
        </Link>
      </div>
    </div>
  );
}
