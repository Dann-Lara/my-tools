'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '../../../../components/ui/DashboardLayout';
import { useI18n } from '../../../../lib/i18n-context';
import { useAuth } from '../../../../hooks/useAuth';
import { PermissionGate } from '../../../../components/ui/PermissionGate';
import { Spinner } from '../../../../components/ui/Spinner';
import {
  getChannels,
  type Channel,
} from '../../../../lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

function ChannelsContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadChannels();
  }, [authLoading, user]);

  async function loadChannels() {
    setLoading(true);
    try {
      const data = await getChannels();
      setChannels(data);
    } catch (err) {
      console.error('Failed to load channels:', err);
    } finally {
      setLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      setup: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      active: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
      paused: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      monetized: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    };
    return styles[status] || styles.setup;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      setup: t.youtube.statusSetup,
      active: t.youtube.statusActive,
      paused: t.youtube.statusPaused,
      monetized: t.youtube.statusMonetized,
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
      <div className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.4em]">
            {t.youtube.title}
          </p>
          <h1 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white">
            <span>{t.youtube.myChannels}</span>
          </h1>
        </div>
        <Link
          // @ts-expect-error - typedRoutes has issues with new routes
          href="/admin/youtube/niches"
          className="btn-secondary"
        >
          {t.youtube.niches}
        </Link>
      </div>

      {channels.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="mb-4">{t.youtube.noChannels}</p>
          <Link
            // @ts-expect-error - typedRoutes has issues with new routes
            href="/admin/youtube/niches"
            className="btn-primary"
          >
            {t.youtube.chooseNiche}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((channel) => (
            <div
              key={channel.id}
              className="card p-5 cursor-pointer hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
              // @ts-expect-error - typedRoutes has issues with dynamic params
              onClick={() => router.push(`/admin/youtube/${channel.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">{channel.name}</h3>
                <span className={`text-[10px] px-2 py-1 rounded ${getStatusBadge(channel.status)}`}>
                  {getStatusLabel(channel.status)}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {channel.description || t.youtube.noDescription}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChannelsPage() {
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <DashboardLayout variant="admin" user={user} title="YouTube - Canales">
      <PermissionGate module="youtube">
        <ChannelsContent />
      </PermissionGate>
    </DashboardLayout>
  );
}
