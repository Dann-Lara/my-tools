'use client';

import { useAuth } from '../../../hooks/useAuth';
import { DashboardLayout } from '../../../components/ui/DashboardLayout';
import { PermissionGate } from '../../../components/ui/PermissionGate';
import { Spinner } from '../../../components/ui/Spinner';

const ADMIN_ROLES = ['superadmin', 'admin'];

export default function AdminYoutubePage() {
  const { user, loading: authLoading } = useAuth(ADMIN_ROLES);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner />
      </div>
    );
  }

  return (
    <DashboardLayout variant="admin" user={user} title="YouTube Channel Hack">
      <PermissionGate module="youtube">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
          <div className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-slate-400 mb-2">
              YouTube Channel Hack
            </p>
            <h1 className="font-mono text-4xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              YouTube
            </h1>
            <p className="font-mono text-[12px] text-slate-400 mt-3">
              Gestiona tus canales de YouTube y genera ideas de contenido con IA
            </p>
          </div>

          <div className="card p-6">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              Esta es la vista de administrador. Los clientes acceden desde su panel.
            </p>
            <a 
              href="/client/youtube" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-mono text-[10px] uppercase tracking-wider transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/>
                <path d="m10 15 5-3-5-3z"/>
              </svg>
              Ir a Vista de Cliente
            </a>
          </div>
        </div>
      </PermissionGate>
    </DashboardLayout>
  );
}
