'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DashboardLayout } from '../../../../components/ui/DashboardLayout';
import { useI18n } from '../../../../lib/i18n-context';
import { useAuth } from '../../../../hooks/useAuth';
import { usePermissions } from '../../../../lib/permissions-context';
import { PermissionGate } from '../../../../components/ui/PermissionGate';
import { Spinner } from '../../../../components/ui/Spinner';
import {
  getChannelById,
  getIdeasByChannel,
  type Channel,
  type ContentIdea,
} from '../../../../lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

function ChannelDetailContent() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const { hasPermission } = usePermissions();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);

  const channelId = params.id as string;

  useEffect(() => {
    if (!hasPermission('youtube')) {
      router.push('/admin');
      return;
    }
    loadData();
  }, [channelId]);

  async function loadData() {
    setLoading(true);
    try {
      const [channelData, ideasData] = await Promise.all([
        getChannelById(channelId),
        getIdeasByChannel(channelId),
      ]);
      setChannel(channelData);
      setIdeas(ideasData);
    } catch (err) {
      console.error('Failed to load channel:', err);
      router.push('/admin/youtube');
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

  const getIdeaStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      idea: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
      scripted: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
      filmed: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
      published: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
      analyzed: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    };
    return styles[status] || styles.idea;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
      <button
        onClick={() => router.push('/admin/youtube')}
        className="mb-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2"
      >
        &larr; {t.youtube.backToChannels || 'Back to Channels'}
      </button>

      <div className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-10">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.4em] mb-2">
              {channel.nicheId}
            </p>
            <h1 className="headline text-3xl md:text-5xl text-slate-900 dark:text-white">
              {channel.name}
            </h1>
          </div>
          <span className={`text-xs px-3 py-1.5 rounded ${getStatusBadge(channel.status)}`}>
            {getStatusLabel(channel.status)}
          </span>
        </div>
        {channel.description && (
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl">
            {channel.description}
          </p>
        )}
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800/60">
        <button className="pb-3 px-1 font-mono text-[11px] uppercase tracking-widest text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400">
          Ideas
        </button>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="mb-4">{t.youtube.noIdeas || 'No ideas yet'}</p>
          <button className="btn-primary">
            {t.youtube.generateIdeas || 'Generate Ideas'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div key={idea.id} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white">{idea.title}</h3>
                <span className={`text-[10px] px-2 py-1 rounded ${getIdeaStatusBadge(idea.status)}`}>
                  {idea.status}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                {idea.hook}
              </p>
              <div className="flex gap-2 flex-wrap">
                {idea.topKeywords?.slice(0, 3).map((kw) => (
                  <span key={kw} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ChannelDetailPage() {
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <DashboardLayout variant="admin" user={user} title="YouTube Channel">
      <PermissionGate module="youtube">
        <ChannelDetailContent />
      </PermissionGate>
    </DashboardLayout>
  );
}
