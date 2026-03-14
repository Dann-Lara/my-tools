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
import { NewApplicationForm } from '../../../../components/applications';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

export default function NewApplicationPage() {
  const { t, locale } = useI18n();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const router = useRouter();
  
  const headerRef = useFadeInUp<HTMLDivElement>({ delay: 0, duration: 600 });

  const {
    cvComplete,
    baseCVLoading,
    loadBaseCV,
    loadApps,
    toast,
    showToast,
  } = useApplications({ authLoading, user });

  useEffect(() => {
    if (user) {
      loadBaseCV();
    }
  }, [user, loadBaseCV]);

  if (authLoading || !user || baseCVLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner />
      </div>
    );
  }

  if (!cvComplete) {
    router.push('/client/applications/base-cv');
    return null;
  }

  const variant = (user.role === 'client' ? 'client' : 'admin') as 'admin' | 'client';

  return (
    <DashboardLayout variant={variant} user={user} title={t.applications.tabNew}>
      <PermissionGate module="applications">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
          <div ref={headerRef} className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-2">
              {t.applications.moduleLabel}
            </p>
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              {t.applications.tabNew}
            </h1>
            <p className="font-mono text-[12px] text-slate-400 mt-3">{t.applications.newAppSubtitle}</p>
          </div>

          <NewApplicationForm
            cvComplete={cvComplete}
            lang={locale}
            onSaved={() => { 
              showToast(t.applications.toastAppSaved, 'ok'); 
              router.push('/client/applications'); 
            }}
            onGoToBaseCV={() => router.push('/client/applications/base-cv')}
            t={t as { applications: Record<string, string> }}
          />
        </div>
      </PermissionGate>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </DashboardLayout>
  );
}
