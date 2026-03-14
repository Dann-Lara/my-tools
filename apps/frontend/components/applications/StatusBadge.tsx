'use client';

import { AppStatus } from './types';

interface StatusBadgeProps {
  status: AppStatus;
}

const statusConfig: Record<AppStatus, { label: string; labelEn: string; color: string; bg: string }> = {
  pending: {
    label: 'Pendiente',
    labelEn: 'Pending',
    color: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  in_process: {
    label: 'En proceso',
    labelEn: 'In Progress',
    color: 'text-sky-700 dark:text-sky-400',
    bg: 'bg-sky-100 dark:bg-sky-900/30',
  },
  accepted: {
    label: 'Aceptado',
    labelEn: 'Accepted',
    color: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
  },
  rejected: {
    label: 'Rechazado',
    labelEn: 'Rejected',
    color: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'pending' ? 'bg-amber-500 animate-pulse' :
        status === 'in_process' ? 'bg-sky-500' :
        status === 'accepted' ? 'bg-emerald-500' :
        'bg-rose-500'
      }`} />
      <span className={`font-mono text-[9px] uppercase tracking-wider ${config.color}`}>
        {config.label}
      </span>
    </span>
  );
}
