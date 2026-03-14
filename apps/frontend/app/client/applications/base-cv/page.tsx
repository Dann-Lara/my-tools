'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useI18n } from '../../../../lib/i18n-context';
import { useAuth } from '../../../../hooks/useAuth';
import { useFadeInUp } from '../../../../hooks/useAnime';
import { useApplications } from '../../../../hooks/useApplications';
import { DashboardLayout } from '../../../../components/ui/DashboardLayout';
import { PermissionGate } from '../../../../components/ui/PermissionGate';
import { Spinner } from '../../../../components/ui/Spinner';
import { Toast } from '../../../../components/ui/Toast';
import { BaseCVForm } from '../../../../components/applications';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

export default function BaseCVPage() {
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const router = useRouter();
  
  const headerRef = useFadeInUp<HTMLDivElement>({ delay: 0, duration: 600 });

  const {
    baseCV,
    cvComplete,
    loadApps,
    toast,
    showToast,
  } = useApplications({ authLoading, user });

  const isEditing = !!cvComplete;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner />
      </div>
    );
  }

  const variant = (user.role === 'client' ? 'client' : 'admin') as 'admin' | 'client';

  return (
    <DashboardLayout variant={variant} user={user} title={t.applications.baseCVPageTitle}>
      <PermissionGate module="applications">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
          <div ref={headerRef} className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-8">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-2">
                  {t.applications.moduleLabel}
                </p>
                <h1 className="font-mono text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {isEditing ? t.applications.editBaseCV : t.applications.createBaseCV}
                </h1>
                <p className="font-mono text-[12px] text-slate-400 mt-3">{t.applications.baseCVPageSubtitle}</p>
              </div>
              {isEditing && (
                <button
                  onClick={() => router.push('/client/applications')}
                  className="btn-secondary text-[11px] py-2.5 px-5 flex items-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                  {t.applications.backToApplications}
                </button>
              )}
            </div>
          </div>

          <BaseCVForm
            initialCV={baseCV}
            lang={locale}
            onSaved={saved => {
              showToast(t.applications.toastCVSaved, 'ok');
              router.push('/client/applications');
            }}
            t={t as { applications: Record<string, string> }}
          />
        </div>
      </PermissionGate>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </DashboardLayout>
  );
}
