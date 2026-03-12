export interface User {
  id: string;
  email: string;
  name: string;
  role: 'superadmin' | 'admin' | 'client';
  isActive: boolean;
  createdAt: string;
}

export type UserRole = User['role'];

export const USER_ROLE_STYLES: Record<UserRole, string> = {
  superadmin: 'text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400/30 bg-yellow-50 dark:bg-yellow-400/5',
  admin:      'text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-400/30 bg-sky-50 dark:bg-sky-400/5',
  client:     'text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40',
};

export function getHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ailab_at') : null;
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
