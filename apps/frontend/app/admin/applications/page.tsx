'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '../../../lib/i18n-context';
import { useAuth } from '../../../hooks/useAuth';
import { useFadeInUp, useStaggerIn } from '../../../hooks/useAnime';
import { useApplications } from '../../../hooks/useApplications';
import { DashboardLayout } from '../../../components/ui/DashboardLayout';
import { PermissionGate } from '../../../components/ui/PermissionGate';
import { Spinner } from '../../../components/ui/Spinner';
import { Toast } from '../../../components/ui/Toast';
import { AppCard, SkeletonList } from '../../../components/applications';
import type { AppStatus } from '../../../components/applications/types';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

export default function ApplicationsPage() {
  const { t } = useI18n();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const router = useRouter();
  
  const headerRef = useFadeInUp<HTMLDivElement>({ delay: 0, duration: 600 });
  const listRef = useStaggerIn<HTMLDivElement>({ delay: 200, stagger: 80, duration: 400 });
  
  const [filter, setFilter] = useState<'all' | AppStatus>('all');

  const {
    apps,
    appsLoading,
    baseCVLoading,
    baseCV,
    loadApps,
    loadBaseCV,
    deleteApp,
    updateStatus,
    cvComplete,
    toast,
    showToast,
  } = useApplications({ authLoading, user });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user) {
      loadBaseCV();
    }
  }, [user, loadBaseCV]);

  useEffect(() => {
    if (!authLoading && user && !baseCVLoading) {
      const hasBaseCV = baseCV?.cvText && baseCV.cvText.length > 0;
      if (!hasBaseCV && apps.length === 0) {
        router.push('/client/applications/base-cv');
      }
    }
  }, [authLoading, user, baseCVLoading, baseCV, apps, router]);

  if (authLoading || !user || baseCVLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner />
      </div>
    );
  }

  const variant = (user.role === 'client' ? 'client' : 'admin') as 'admin' | 'client';

  const filteredApps = filter === 'all' 
    ? apps 
    : apps.filter(app => app.status === filter);

  const statusCounts = {
    all: apps.length,
    pending: apps.filter(a => a.status === 'pending').length,
    in_process: apps.filter(a => a.status === 'in_process').length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  return (
    <DashboardLayout variant={variant} user={user} title={t.applications.pageTitle}>
      <PermissionGate module="applications">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
          <div ref={headerRef} className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-2">
                  {t.applications.moduleLabel}
                </p>
                <h1 className="font-mono text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {t.applications.pageTitle}
                </h1>
                <p className="font-mono text-[12px] text-slate-400 mt-3">{t.applications.pageSubtitle}</p>
              </div>

              <div className="flex items-center gap-3">
                {!cvComplete ? (
                  <Link 
                    href="/client/applications/base-cv"
                    className="btn-primary text-[11px] py-2.5 px-5 flex items-center gap-2"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    {t.applications.createBaseCV}
                  </Link>
                ) : (
                  <>
                    <Link 
                      href="/client/applications/new"
                      className="btn-primary text-[11px] py-2.5 px-5 flex items-center gap-2"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      {t.applications.tabNew}
                    </Link>
                    <Link 
                      href="/client/applications/base-cv"
                      className="btn-secondary text-[11px] py-2.5 px-5"
                    >
                      {t.applications.editBaseCV}
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          {!cvComplete && (
            <div className="mb-6 flex items-start gap-3 p-4 rounded-xl border border-amber-200 dark:border-amber-400/30 bg-amber-50 dark:bg-amber-400/5">
              <div className="flex-1">
                <p className="font-mono text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                  {t.applications.cvBaseRequiredTitle}
                </p>
                <p className="font-mono text-[10px] text-amber-600 dark:text-amber-500 mt-0.5">
                  {t.applications.cvBaseRequiredDesc}
                </p>
              </div>
              <Link 
                href="/client/applications/base-cv"
                className="shrink-0 font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white transition-colors whitespace-nowrap"
              >
                {t.applications.createBaseCV}
              </Link>
            </div>
          )}

          {/* Filters */}
          <div ref={listRef} className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
            {(['all', 'pending', 'in_process', 'accepted', 'rejected'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-mono text-[10px] uppercase tracking-widest shrink-0 rounded-lg transition-all
                  ${filter === status 
                    ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20' 
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
              >
                {status === 'all' ? `Todas (${statusCounts.all})` : 
                 status === 'pending' ? `⏳ Pendientes (${statusCounts.pending})` :
                 status === 'in_process' ? `🚧 En proceso (${statusCounts.in_process})` :
                 status === 'accepted' ? `✅ Aceptados (${statusCounts.accepted})` :
                 `❌ Rechazados (${statusCounts.rejected})`}
              </button>
            ))}
          </div>

          {/* List */}
          {appsLoading ? (
            <SkeletonList count={3} />
          ) : filteredApps.length === 0 ? (
            <div className="card p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-slate-400">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <p className="font-mono text-[13px] text-slate-500 mb-4">
                {filter === 'all' ? t.applications.noApps : 'No hay postulaciones con este filtro'}
              </p>
              {filter === 'all' && (
                <Link href="/client/applications/new" className="btn-primary text-[11px] py-2.5 px-6 inline-flex">
                  {t.applications.createFirstApp}
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredApps.map((app) => (
                <AppCard 
                  key={app.id}
                  app={app}
                  userRole={user.role}
                  onDelete={deleteApp}
                  onStatusChange={updateStatus}
                  t={t.applications}
                />
              ))}
            </div>
          )}
        </div>
      </PermissionGate>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </DashboardLayout>
  );
}
