'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { Application, AppStatus } from './types';
import { AtsBadge } from './AtsBadge';
import { DropdownPortal } from '../ui/DropdownPortal';

interface AppCardProps {
  app: Application;
  userRole: string;
  onStatusChange?: (id: string, status: AppStatus) => void;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, data: Partial<Application>) => void;
  t?: { [key: string]: string };
}

const statusMap: Record<AppStatus, { label: string; colors: string; dot: string }> = {
  pending: {
    label: 'Pendiente',
    colors: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/50',
    dot: 'bg-amber-500',
  },
  in_process: {
    label: 'En proceso',
    colors: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400 border-sky-300 dark:border-sky-700 hover:bg-sky-200 dark:hover:bg-sky-900/50',
    dot: 'bg-sky-500',
  },
  accepted: {
    label: 'Aceptado',
    colors: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900/50',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rechazado',
    colors: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-300 dark:border-rose-700 hover:bg-rose-200 dark:hover:bg-rose-900/50',
    dot: 'bg-rose-500',
  },
};

const allStatuses: AppStatus[] = ['pending', 'in_process', 'accepted', 'rejected'];

export function StatusSelector({
  status,
  onChange,
  t,
}: {
  status: AppStatus;
  onChange: (status: AppStatus) => void;
  t?: { [key: string]: string };
}) {
  const [open, setOpen] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<AppStatus | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const current = statusMap[status];

  const handleSelect = (newStatus: AppStatus) => {
    if (newStatus !== status) {
      setConfirmStatus(newStatus);
    }
    setOpen(false);
  };

  const handleConfirm = () => {
    if (confirmStatus) {
      onChange(confirmStatus);
    }
    setConfirmStatus(null);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-mono border transition-all ${current.colors}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${current.dot}`} />
        {current.label}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className="ml-0.5 opacity-60"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <DropdownPortal
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={buttonRef}
        align="right"
        width={170}
      >
        {allStatuses.map((s) => {
          const meta = statusMap[s];
          const isSelected = s === status;
          return (
            <button
              key={s}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleSelect(s);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 text-[11px] font-mono transition-colors ${
                isSelected
                  ? meta.colors
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
              } ${s !== allStatuses[0] ? 'border-t border-slate-100 dark:border-slate-700' : ''}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {meta.label}
              {isSelected && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  className="ml-auto"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          );
        })}
      </DropdownPortal>

      {confirmStatus && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
          onClick={(e) => {
            e.preventDefault();
            setConfirmStatus(null);
          }}
        >
          <div
            className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-sm mx-4 shadow-2xl border border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className={`w-3 h-3 rounded-full ${statusMap[confirmStatus].dot}`} />
              <p className="font-mono text-[12px] text-slate-700 dark:text-slate-200">
                {t?.confirmStatusChange?.replace('{status}', statusMap[confirmStatus].label) ??
                  `¿Cambiar estado a ${statusMap[confirmStatus].label}?`}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirm();
                }}
                className="flex-1 font-mono text-[11px] py-2.5 px-4 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
              >
                {t?.statusChangeYes ?? 'Sí, cambiar'}
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setConfirmStatus(null);
                }}
                className="flex-1 font-mono text-[11px] py-2.5 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
              >
                {t?.statusChangeNo ?? 'Cancelar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export function AppCard({
  app,
  userRole,
  onStatusChange,
  onDelete,
  onUpdate,
  t,
}: AppCardProps) {
  const [confirmDel, setConfirmDel] = useState(false);
  const ta = t ?? {};

  return (
    <div className="relative">
      <Link
        href={`/client/applications/${app.id}`}
        className="block card p-4 hover:shadow-lg hover:scale-[1.01] transition-all duration-200 group"
      >
        <div className="flex items-center gap-4">
          {app.atsScore !== undefined && <AtsBadge score={app.atsScore} showLabel={false} />}

          <div className="flex-1 min-w-0">
            <p className="font-mono text-[13px] font-semibold text-slate-800 dark:text-slate-200 truncate">
              {app.position}
            </p>
            <p className="font-mono text-[11px] text-sky-600 dark:text-sky-400 mt-0.5 truncate">
              {app.company}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusSelector
              status={app.status}
              onChange={(newStatus) => onStatusChange?.(app.id, newStatus)}
              t={ta}
            />

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
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="text-rose-500"
              >
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

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-slate-400 group-hover:text-sky-500 transition-colors"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </Link>
    </div>
  );
}
