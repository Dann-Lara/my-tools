'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Application, AppStatus, getHeaders } from './types';
import { AtsBadge } from './AtsBadge';
import { StatusBadge } from './StatusBadge';

interface AppCardProps {
  app: Application;
  userRole: string;
  onStatusChange?: (id: string, status: AppStatus) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<Application>) => void;
  t?: { [key: string]: string };
}

const statusMap: Record<AppStatus, { label: string; color: string }> = {
  pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  in_process: { label: 'En proceso', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  accepted: { label: 'Aceptado', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  rejected: { label: 'Rechazado', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' },
};

export function AppCard({ app, userRole, onStatusChange, onDelete, onUpdate, t }: AppCardProps) {
  const [confirmDel, setConfirmDel] = useState(false);
  const ta = t ?? {};

  const hasCv = app.cvGeneratedEn || app.cvGeneratedEs;
  const meta = statusMap[app.status] ?? statusMap.pending;

  return (
    <Link
      href={`/client/applications/${app.id}`}
      className="block card p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        {app.atsScore !== undefined && (
          <AtsBadge score={app.atsScore} showLabel={false} />
        )}
        
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">
            {app.position}
          </p>
          <p className="font-mono text-[11px] text-sky-600 dark:text-sky-400 mt-0.5 truncate">
            {app.company}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <StatusBadge status={app.status} />
          
          <span className="font-mono text-[10px] text-slate-400">
            {new Date(app.appliedAt).toLocaleDateString('es-MX', {
              month: 'short',
              day: 'numeric',
            })}
          </span>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!confirmDel) {
                setConfirmDel(true);
              }
            }}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
            title={ta.deleteApp ?? 'Eliminar'}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-rose-500">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" />
              <path d="M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>

          {confirmDel && onDelete && (
            <div className="absolute right-4 top-12 bg-white dark:bg-slate-800 shadow-xl rounded-lg p-3 border border-slate-200 dark:border-slate-700 z-10">
              <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 mb-2">
                {ta.deleteConfirm ?? '¿Confirmar?'}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(app.id);
                  }}
                  className="font-mono text-[9px] px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                >
                  {ta.deleteYes ?? 'Sí'}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setConfirmDel(false);
                  }}
                  className="font-mono text-[9px] px-3 py-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  {ta.deleteNo ?? 'No'}
                </button>
              </div>
            </div>
          )}

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 group-hover:text-sky-500 transition-colors">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
