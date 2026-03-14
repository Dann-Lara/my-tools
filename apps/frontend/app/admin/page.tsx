'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardLayout } from '../../components/ui/DashboardLayout';
import { Spinner } from '../../components/ui/Spinner';
import { useI18n } from '../../lib/i18n-context';
import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../lib/permissions-context';
import type { AuthUser } from '../../lib/auth';
import { checklistsApi, type Checklist } from '../../lib/checklists';
import { CHECKLIST_STATUS_STYLES } from '../../components/checklists/constants';
import { type Application, getHeaders } from '../../components/applications';

const ADMIN_ROLES = ['superadmin', 'admin'];

type SvcKey = 'svcFrontend'|'svcBackend'|'svcDatabase'|'svcCache'|'svcAutomation'|'svcApiDocs';
const SERVICES: { labelKey: SvcKey; value: string; port: string }[] = [
  { labelKey: 'svcFrontend',   value: 'Next.js 14',    port: '3000' },
  { labelKey: 'svcBackend',    value: 'NestJS',        port: '3001' },
  { labelKey: 'svcDatabase',   value: 'PostgreSQL 16', port: '5432' },
  { labelKey: 'svcCache',      value: 'Redis',         port: '6379' },
  { labelKey: 'svcAutomation', value: 'n8n',           port: '5678' },
  { labelKey: 'svcApiDocs',    value: 'Swagger',       port: '3001/api/docs' },
];

function ChecklistProgressCard({ checklist }: { checklist: Checklist }) {
  const completed = checklist.items.filter((i) => i.status === 'completed').length;
  const total = checklist.items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Link href={`/checklists/${checklist.id}`}
      className="card p-4 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 block">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-200 truncate">
            {checklist.title}
          </p>
          {checklist.category && (
            <p className="font-mono text-[9px] text-slate-400 uppercase mt-0.5">{checklist.category}</p>
          )}
        </div>
        <span className={`font-mono text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0 ${CHECKLIST_STATUS_STYLES[checklist.status as keyof typeof CHECKLIST_STATUS_STYLES]}`}>
          {checklist.status}
        </span>
      </div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[9px] text-slate-400">{completed}/{total}</span>
        <span className="font-mono text-[9px] font-bold text-sky-600 dark:text-sky-400">{pct}%</span>
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
             style={{
               width: `${pct}%`,
               backgroundColor: pct >= 80 ? '#34d399' : pct >= 40 ? '#38bdf8' : '#f59e0b',
             }} />
      </div>
    </Link>
  );
}

function StatsCard({ label, value, color, subtext }: { label: string; value: string | number; color: string; subtext?: string }) {
  return (
    <div className="card p-4 text-center">
      <p className={`font-mono text-2xl font-bold ${color}`}>{value}</p>
      <p className="font-mono text-[9px] uppercase tracking-widest text-slate-400 mt-1">{label}</p>
      {subtext && <p className="font-mono text-[8px] text-slate-500 mt-0.5">{subtext}</p>}
    </div>
  );
}

function QuickNavCards({ hasPermission, userRole, checklistsLength, activeChecklists, appsLength, pendingApps }: {
  hasPermission: (key: string) => boolean;
  userRole: string;
  checklistsLength: number;
  activeChecklists: number;
  appsLength: number;
  pendingApps: number;
}) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
      {hasPermission('checklist') && (
        <Link href="/checklists" className="card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-400/10 border border-sky-200 dark:border-sky-400/20 flex items-center justify-center text-sky-500 dark:text-sky-400 shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9l4.5 4.5 7.5-7.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p className="font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-200" suppressHydrationWarning>{t.checklist.myChecklists}</p>
            <p className="font-mono text-[9px] text-slate-400 mt-0.5">{checklistsLength} total · {activeChecklists} activos</p>
          </div>
          <span className="ml-auto font-mono text-[10px] text-slate-300 dark:text-slate-700 group-hover:text-sky-400 transition-colors">→</span>
        </Link>
      )}
      {(userRole === 'superadmin' || userRole === 'admin') && (
        <Link href="/admin/users" className="card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-400/10 border border-violet-200 dark:border-violet-400/20 flex items-center justify-center text-violet-500 dark:text-violet-400 shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M3 16c0-3.3 2.7-6 6-6s6 2.7 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
          </div>
          <div>
            <p className="font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-200" suppressHydrationWarning>{t.nav.users}</p>
            <p className="font-mono text-[9px] text-slate-400 mt-0.5">Gestionar usuarios</p>
          </div>
          <span className="ml-auto font-mono text-[10px] text-slate-300 dark:text-slate-700 group-hover:text-violet-400 transition-colors">→</span>
        </Link>
      )}
      {hasPermission('applications') && (
              <Link href={`/admin/applications` as any} className="card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-400/10 border border-violet-200 dark:border-violet-400/20 flex items-center justify-center text-violet-500 dark:text-violet-400 shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5"/><path d="M6 9l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div>
            <p className="font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-200" suppressHydrationWarning>{t.applications?.tabList ?? 'Postulaciones'}</p>
            <p className="font-mono text-[9px] text-slate-400 mt-0.5">{appsLength} total · {pendingApps} pendientes</p>
          </div>
          <span className="ml-auto font-mono text-[10px] text-slate-300 dark:text-slate-700 group-hover:text-violet-400 transition-colors">→</span>
        </Link>
      )}
      {hasPermission('ai') && (
        <Link href="/admin/ai" className="card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex items-center gap-4 group">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-400/10 border border-emerald-200 dark:border-emerald-400/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83"/></svg>
          </div>
          <div>
            <p className="font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-200">AI Tools</p>
            <p className="font-mono text-[9px] text-slate-400 mt-0.5">Generador y resumidor</p>
          </div>
          <span className="ml-auto font-mono text-[10px] text-slate-300 dark:text-slate-700 group-hover:text-emerald-400 transition-colors">→</span>
        </Link>
      )}
    </div>
  );
}

function AdminDashboardContent({ user, logout }: { user: AuthUser; logout: () => void }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [apps, setApps] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'system'>('overview');

  useEffect(() => {
    checklistsApi.list().then(setChecklists).catch(() => {});
    fetch('/api/applications', { headers: getHeaders() })
      .then(res => res.json())
      .then(data => setApps(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, [pathname]);

  const roleColor = user.role === 'superadmin'
    ? 'text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-400/30 bg-yellow-50 dark:bg-yellow-400/5'
    : 'text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-400/30 bg-sky-50 dark:bg-sky-400/5';

  const activeChecklists = checklists.filter((c) => c.status === 'active').length;
  const allItems = checklists.flatMap((c) => c.items ?? []);
  const completedItems = allItems.filter((i) => i.status === 'completed').length;
  const pendingApps = apps.filter(a => a.status === 'pending').length;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
      <div className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.4em]" suppressHydrationWarning>{t.dashboard.adminTitle}</p>
          <h1 className="headline text-5xl md:text-7xl text-slate-900 dark:text-white">
            <span suppressHydrationWarning>{t.dashboard.welcomeBack}</span>,<br/>
            <span className="text-sky-600 dark:text-sky-400">{user.name.split(' ')[0]}</span>
          </h1>
          <div className="flex items-center gap-3 pt-1">
            <span className={`font-mono text-[10px] uppercase tracking-widest px-3 py-1 rounded border ${roleColor}`}>{user.role}</span>
            <span className="font-mono text-[10px] text-slate-400">{user.email}</span>
          </div>
        </div>
        <button onClick={logout} className="btn-ghost text-[10px] py-2 px-4 self-start md:self-auto" suppressHydrationWarning>{t.nav.logout} →</button>
      </div>

      <div className="flex gap-1 mb-8 border-b border-slate-200 dark:border-slate-800">
        {(['overview', 'system'] as const).map((id) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className={`font-mono text-[10px] uppercase tracking-widest px-5 py-3 border-b-2 -mb-px transition-all ${activeTab === id ? 'border-sky-500 text-sky-600 dark:text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`} suppressHydrationWarning>
            {id === 'overview' ? 'Resumen' : 'Sistema'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {hasPermission('checklist') && (
              <>
                <StatsCard label="Checklists" value={checklists.length} color="text-sky-600 dark:text-sky-400" subtext={`${activeChecklists} activos`} />
                <StatsCard label="Tareas" value={completedItems} color="text-emerald-600 dark:text-emerald-400" subtext={`de ${allItems.length}`} />
              </>
            )}
            {hasPermission('applications') && (
              <>
                <StatsCard label="Aplicaciones" value={apps.length} color="text-violet-600 dark:text-violet-400" subtext={`${pendingApps} pendientes`} />
                <StatsCard label="Aceptados" value={apps.filter(a => a.status === 'accepted').length} color="text-green-600 dark:text-green-400" subtext={`${apps.filter(a => a.status === 'rejected').length} rechazados`} />
              </>
            )}
          </div>

          <QuickNavCards hasPermission={hasPermission} userRole={user.role} checklistsLength={checklists.length} activeChecklists={activeChecklists} appsLength={apps.length} pendingApps={pendingApps} />

          {hasPermission('checklist') && checklists.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400" suppressHydrationWarning>{t.dashboard.checklistProgress}</p>
                <Link href="/checklists" className="font-mono text-[9px] text-sky-500 dark:text-sky-400 hover:underline" suppressHydrationWarning>{t.dashboard.viewAll} →</Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {checklists.slice(0, 6).map((cl) => <ChecklistProgressCard key={cl.id} checklist={cl} />)}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'system' && (
        <>
          <div className="mb-8">
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 mb-4">Servicios</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {SERVICES.map(({ labelKey, value, port }) => (
                <div key={labelKey} className="card p-4">
                  <p className="font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">{value}</p>
                  <p className="font-mono text-[9px] text-slate-400 mt-1">:{port}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-slate-400 mb-4">Herramientas AI</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {['Generador de Texto', 'Resumidor'].map((title, i) => (
                <Link key={i} href="/admin/ai" className="card p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${i === 0 ? 'bg-sky-50 dark:bg-sky-400/10 border-sky-200 dark:border-sky-400/20 text-sky-500 dark:text-sky-400' : 'bg-emerald-50 dark:bg-emerald-400/10 border-emerald-200 dark:border-emerald-400/20 text-emerald-500 dark:text-emerald-400'}`}>
                      <svg width="18" height="18" viewBox="0 0 14 14" fill="none">
                        {i === 0 ? <path d="M7 1.5L8 5.5l4 1-4 1-1 4-1-4-4-1 4-1 1-4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/> : <path d="M2 10l3-3 2 2 5-6 2 2-7 5" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round"/>}
                      </svg>
                    </div>
                    <div>
                      <p className="font-mono text-[12px] font-semibold text-slate-800 dark:text-slate-200">{title}</p>
                      <p className="font-mono text-[9px] text-slate-400 mt-0.5">{i === 0 ? 'Crea contenido con IA' : 'Resume documentos'}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function AdminDashboard(): React.JSX.Element {
  const { t } = useI18n();
  const { user, loading, logout } = useAuth(ADMIN_ROLES);

  if (loading || !user) {
    return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center"><Spinner /></div>;
  }

  return (
    <DashboardLayout variant="admin" user={user} title={t.nav.dashboard}>
      <AdminDashboardContent user={user} logout={logout} />
    </DashboardLayout>
  );
}
