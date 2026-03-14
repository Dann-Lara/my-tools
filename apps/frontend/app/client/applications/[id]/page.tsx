'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '../../../../lib/i18n-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useFadeInUp } from '../../../../hooks/useAnime';
import { DashboardLayout } from '../../../../components/ui/DashboardLayout';
import { Spinner } from '../../../../components/ui/Spinner';
import { Toast } from '../../../../components/ui/Toast';
import { InterviewSimulator, Application, BaseCV, getHeaders, EMPTY_CV, AppStatus } from '../../../../components/applications';
import { PermissionGate } from '../../../../components/ui/PermissionGate';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

export default function ApplicationDetailPage() {
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const params = useParams();
  const router = useRouter();
  const headerRef = useFadeInUp<HTMLDivElement>({ delay: 0, duration: 500 });

  const [app, setApp] = useState<Application | null>(null);
  const [appLoading, setAppLoading] = useState(true);
  const [baseCV, setBaseCV] = useState<BaseCV>(EMPTY_CV);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const appId = params.id as string;

  const showToast = useCallback((msg: string, type: 'ok' | 'err') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadApp = useCallback(async () => {
    if (!appId) return;
    setAppLoading(true);
    try {
      const res = await fetch(`/api/applications/${appId}`, { headers: getHeaders() });
      if (res.ok) {
        const data = (await res.json()) as Application;
        setApp(data);
      }
    } catch { /* ignore */ }
    finally { setAppLoading(false); }
  }, [appId]);

  const loadBaseCV = useCallback(async () => {
    try {
      const res = await fetch('/api/applications/base-cv', { headers: getHeaders() });
      if (res.ok) {
        const data = (await res.json()) as BaseCV;
        if (data?.fullName !== undefined) {
          setBaseCV({ ...EMPTY_CV, ...data });
        }
      }
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadApp();
      loadBaseCV();
    }
  }, [authLoading, user, loadApp, loadBaseCV]);

  function updateApp(id: string, patch: Partial<Application>) {
    setApp(prev => prev ? { ...prev, ...patch } : null);
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner />
      </div>
    );
  }

  const variant = (user.role === 'client' ? 'client' : 'admin') as 'admin' | 'client';

  const statusMap: Record<AppStatus, { label: string; color: string }> = {
    pending: { label: t.applications.statusPending, color: 'text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-400/10' },
    in_process: { label: t.applications.statusInProcess, color: 'text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-400/10' },
    accepted: { label: t.applications.statusAccepted, color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-400/10' },
    rejected: { label: t.applications.statusRejected, color: 'text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-400/10' },
  };

  return (
    <DashboardLayout variant={variant} user={user} title={t.applications.detailTitle}>
      <PermissionGate module="applications">
        <div className="max-w-[1200px] mx-auto px-6 md:px-12 pt-8 pb-16">
          <Link
            href="/client/applications"
            className="inline-flex items-center gap-2 font-mono text-[11px] text-slate-500 hover:text-sky-500 dark:text-slate-400 dark:hover:text-sky-400 mb-6 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {t.applications.detailBack}
          </Link>

          <div ref={headerRef} className="py-6 border-b border-slate-200 dark:border-slate-800/60 mb-8">
            <h1 className="font-mono text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
              {app?.company || '...'}
            </h1>
            <p className="font-mono text-lg text-slate-500 dark:text-slate-400 mt-1">
              {app?.position || '...'}
            </p>
          </div>

          {appLoading ? (
            <div className="flex items-center gap-3 py-12 justify-center">
              <Spinner />
              <p className="font-mono text-[11px] text-slate-400">{t.applications.loadingApps}</p>
            </div>
          ) : app ? (
            <div className="space-y-8">
              {/* Status & Meta */}
              <div className="card p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                      {t.applications.detailStatus}
                    </p>
                    <span className={`inline-block px-3 py-1 rounded-full font-mono text-[10px] font-semibold ${statusMap[app.status].color}`}>
                      {statusMap[app.status].label}
                    </span>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                      {t.applications.detailAppliedAt}
                    </p>
                    <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {new Date(app.appliedAt).toLocaleDateString(locale === 'es' ? 'es-MX' : 'en-US')}
                    </p>
                  </div>
                  {app.atsScore !== undefined && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                        {t.applications.atsScoreLabel}
                      </p>
                      <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {app.atsScore}%
                      </p>
                    </div>
                  )}
                  {app.appliedFrom && (
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-1">
                        {t.applications.appliedFromLabel}
                      </p>
                      <p className="font-mono text-[11px] text-slate-700 dark:text-slate-300">
                        {app.appliedFrom}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Job Offer */}
              {app.jobOffer && (
                <div className="card p-6">
                  <h2 className="font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-4">
                    {t.applications.detailJobOffer}
                  </h2>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="font-mono text-[10.5px] text-slate-600 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                      {app.jobOffer}
                    </p>
                  </div>
                </div>
              )}

              {/* Generated CV */}
              <div className="card p-6">
                <h2 className="font-mono text-[11px] uppercase tracking-widest text-slate-500 mb-4">
                  {t.applications.detailGeneratedCV}
                </h2>
                {app.cvGeneratedEs || app.cvGeneratedEn ? (
                  <div className="flex flex-wrap gap-3">
                    {app.cvGeneratedEs && (
                      <button
                        onClick={() => {
                          const win = window.open('', '_blank');
                          if (win) {
                            win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CV</title></head><body style="font-family: Arial; white-space: pre-wrap;">${app.cvGeneratedEs}</body></html>`);
                            win.document.close();
                          }
                        }}
                        className="btn-primary text-[10px] py-2 px-4"
                      >
                        {t.applications.detailDownloadES}
                      </button>
                    )}
                    {app.cvGeneratedEn && (
                      <button
                        onClick={() => {
                          const win = window.open('', '_blank');
                          if (win) {
                            win.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>CV</title></head><body style="font-family: Arial; white-space: pre-wrap;">${app.cvGeneratedEn}</body></html>`);
                            win.document.close();
                          }
                        }}
                        className="btn-primary text-[10px] py-2 px-4"
                      >
                        {t.applications.detailDownloadEN}
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="font-mono text-[11px] text-slate-400">
                    {t.applications.detailNoCV}
                  </p>
                )}
              </div>

              {/* Interview Simulator */}
              <InterviewSimulator
                application={app}
                baseCV={baseCV.summary || baseCV.experience || undefined}
                onUpdate={updateApp}
                t={t as { applications: Record<string, string> }}
              />
            </div>
          ) : (
            <div className="card p-8 text-center">
              <p className="font-mono text-[13px] text-slate-500">Postulación no encontrada</p>
            </div>
          )}
        </div>
      </PermissionGate>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </DashboardLayout>
  );
}
