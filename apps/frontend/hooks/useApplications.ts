'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../lib/i18n-context';
import {
  Application,
  BaseCV,
  AppStatus,
  getHeaders,
  EMPTY_CV,
  isCVComplete,
} from '../components/applications';

interface UseApplicationsOptions {
  authLoading: boolean;
  user: { role: string } | null;
}

interface UseApplicationsReturn {
  apps: Application[];
  appsLoading: boolean;
  baseCVLoading: boolean;
  baseCV: BaseCV;
  loadApps: () => Promise<void>;
  loadBaseCV: () => Promise<void>;
  updateStatus: (id: string, status: AppStatus) => Promise<void>;
  deleteApp: (id: string) => Promise<void>;
  updateApp: (id: string, patch: Partial<Application>) => void;
  stats: {
    accepted: number;
    rejected: number;
    pending: number;
    avgAts: number;
    acceptRate: number;
  };
  cvComplete: boolean;
  toast: { msg: string; type: 'ok' | 'err' } | null;
  showToast: (msg: string, type: 'ok' | 'err') => void;
}

export function useApplications({ authLoading, user }: UseApplicationsOptions): UseApplicationsReturn {
  const { t } = useI18n();

  const [apps, setApps] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [baseCVLoading, setBaseCVLoading] = useState(true);
  const [baseCV, setBaseCV] = useState<BaseCV>(EMPTY_CV);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const cvComplete = isCVComplete(baseCV);

  function showToast(msg: string, type: 'ok' | 'err') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const loadApps = useCallback(async () => {
    setAppsLoading(true);
    try {
      const res = await fetch('/api/applications', { headers: getHeaders() });
      const data = (await res.json()) as Application[];
      setApps(Array.isArray(data) ? data : []);
    } catch {
      setApps([]);
    } finally {
      setAppsLoading(false);
    }
  }, []);

  const loadBaseCV = useCallback(async () => {
    setBaseCVLoading(true);
    try {
      const res = await fetch('/api/applications/base-cv', { headers: getHeaders() });
      if (res.ok) {
        const data = (await res.json()) as BaseCV;
        if (data?.fullName !== undefined) {
          setBaseCV({ ...EMPTY_CV, ...data });
          localStorage.setItem('ailab_base_cv', JSON.stringify(data));
          setBaseCVLoading(false);
          return;
        }
      }
    } catch { /* fallback */ }
    try {
      const raw = localStorage.getItem('ailab_base_cv');
      if (raw) setBaseCV({ ...EMPTY_CV, ...JSON.parse(raw) as BaseCV });
    } catch { /* defaults */ }
    setBaseCVLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadApps();
      loadBaseCV();
    }
  }, [authLoading, user, loadApps, loadBaseCV]);

  async function updateStatus(id: string, status: AppStatus) {
    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status }),
      });
      setApps(prev => prev.map(a => (a.id === id ? { ...a, status } : a)));
    } catch {
      showToast(t.applications.toastStatusError ?? 'Error updating status', 'err');
    }
  }

  async function deleteApp(id: string) {
    try {
      await fetch(`/api/applications/${id}`, { method: 'DELETE', headers: getHeaders() });
      setApps(prev => prev.filter(a => a.id !== id));
      showToast(t.applications.toastAppDeleted ?? 'Postulación eliminada', 'ok');
    } catch {
      showToast(t.applications.toastStatusError ?? 'Error deleting', 'err');
    }
  }

  function updateApp(id: string, patch: Partial<Application>) {
    setApps(prev => prev.map(a => (a.id === id ? { ...a, ...patch } : a)));
  }

  const accepted = apps.filter(a => a.status === 'accepted').length;
  const rejected = apps.filter(a => a.status === 'rejected').length;
  const pending = apps.filter(a => a.status === 'pending').length;
  const withAts = apps.filter(a => a.atsScore);
  const avgAts = withAts.length
    ? Math.round(withAts.reduce((s, a) => s + (a.atsScore ?? 0), 0) / withAts.length)
    : 0;
  const acceptRate = apps.length ? Math.round((accepted / apps.length) * 100) : 0;

  return {
    apps,
    appsLoading,
    baseCVLoading,
    baseCV,
    loadApps,
    loadBaseCV,
    updateStatus,
    deleteApp,
    updateApp,
    stats: { accepted, rejected, pending, avgAts, acceptRate },
    cvComplete,
    toast,
    showToast,
  };
}
