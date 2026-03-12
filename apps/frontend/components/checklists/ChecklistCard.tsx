'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useI18n } from '../../lib/i18n-context';
import { checklistsApi, type Checklist, type ChecklistStatus } from '../../lib/checklists';

const STATUS_BADGE: Record<ChecklistStatus, string> = {
  active:
    'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/5',
  paused:
    'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/5',
  completed:
    'text-sky-600 dark:text-sky-400 border-sky-200 dark:border-sky-400/30 bg-sky-50 dark:bg-sky-400/5',
};

const DIFF_LABEL: Record<string, string> = {
  low: '▪ low',
  medium: '▪▪ mid',
  high: '▪▪▪ high',
};

interface ChecklistCardProps {
  checklist: Checklist;
  onDelete: () => void;
}

export function ChecklistCard({ checklist, onDelete }: ChecklistCardProps) {
  const { t } = useI18n();
  const [confirmDel, setConfirmDel] = useState(false);
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [telegramMsg, setTelegramMsg] = useState('');

  const completed = checklist.items.filter((i) => i.status === 'completed').length;
  const total = checklist.items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function handleSendToTelegram() {
    if (!checklist.telegramChatId) {
      setTelegramMsg(t.checklist.telegramNoId);
      return;
    }
    setTelegramLoading(true);
    setTelegramMsg('');
    try {
      const res = await checklistsApi.sendToTelegram(checklist.id);
      setTelegramMsg(res.message || t.checklist.telegramSuccess);
    } catch (e) {
      setTelegramMsg(e instanceof Error ? e.message : t.checklist.telegramError);
    } finally {
      setTelegramLoading(false);
    }
  }

  return (
    <div className="card p-5 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span
              className={`font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded border ${STATUS_BADGE[checklist.status]}`}
              suppressHydrationWarning
            >
              {t.checklist[checklist.status]}
            </span>
            {checklist.category && (
              <span className="font-mono text-[9px] text-slate-400 uppercase">
                {checklist.category}
              </span>
            )}
            <span className="font-mono text-[9px] text-slate-400 ml-auto">
              {DIFF_LABEL[checklist.difficulty] ?? checklist.difficulty}
            </span>
          </div>
          <h3 className="font-mono text-[13px] font-semibold text-slate-800 dark:text-slate-200 leading-tight truncate">
            {checklist.title}
          </h3>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[9px] text-slate-400">
            {completed}/{total} {t.checklist.tasksCount}
          </span>
          <span className="font-mono text-[9px] font-bold text-sky-600 dark:text-sky-400">
            {pct}%
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-500 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {telegramMsg && (
        <div
          className={`mt-2 font-mono text-[9px] px-2 py-1.5 rounded border
            ${
              telegramMsg === t.checklist.telegramNoId || telegramMsg === t.checklist.telegramError
                ? 'text-red-600 dark:text-red-400 border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-400/5'
                : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-400/30 bg-emerald-50 dark:bg-emerald-400/5'
            }`}
        >
          {telegramMsg}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="font-mono text-[9px] text-slate-400">
          {new Date(checklist.startDate).toLocaleDateString()} →{' '}
          {new Date(checklist.endDate).toLocaleDateString()}
        </p>
        <div className="flex items-center gap-1.5">
          {!confirmDel ? (
            <>
              {checklist.telegramChatId && (
                <button
                  onClick={() => void handleSendToTelegram()}
                  disabled={telegramLoading}
                  title={t.checklist.sendToTelegramTitle}
                  className="w-7 h-7 rounded border border-transparent
                             text-slate-400 hover:text-sky-500 dark:hover:text-sky-400
                             hover:border-sky-300 dark:hover:border-sky-400/30
                             hover:bg-sky-50 dark:hover:bg-sky-400/10
                             flex items-center justify-center transition-all
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {telegramLoading ? (
                    <svg
                      className="animate-spin"
                      width="11"
                      height="11"
                      viewBox="0 0 16 16"
                      fill="none"
                    >
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
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
              )}
              <Link
                href={`/checklists/${checklist.id}`}
                className="font-mono text-[9px] text-slate-400 hover:text-sky-500 dark:hover:text-sky-400
                           transition-colors px-2 py-1 rounded border border-transparent
                           hover:border-sky-300 dark:hover:border-sky-400/30
                           hover:bg-sky-50 dark:hover:bg-sky-400/10"
              >
                Ver →
              </Link>
              <button
                onClick={() => setConfirmDel(true)}
                className="font-mono text-[9px] text-slate-400 hover:text-red-500 dark:hover:text-red-400
                           transition-colors px-2 py-1 rounded border border-transparent
                           hover:border-red-200 dark:hover:border-red-400/30
                           hover:bg-red-50 dark:hover:bg-red-400/5 flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2 4h10M5 4V2.5h4V4M5.5 6.5v4M8.5 6.5v4M3 4l.8 7.5h6.4L11 4"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onDelete}
                className="font-mono text-[9px] text-red-600 dark:text-red-400 px-2 py-1 rounded
                           border border-red-200 dark:border-red-400/30 bg-red-50 dark:bg-red-400/5"
                suppressHydrationWarning
              >
                {t.common.confirm}
              </button>
              <button
                onClick={() => setConfirmDel(false)}
                className="font-mono text-[9px] text-slate-400 px-2 py-1 rounded
                           border border-slate-200 dark:border-slate-700"
              >
                ✕
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
