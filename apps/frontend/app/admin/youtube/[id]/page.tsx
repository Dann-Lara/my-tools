'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useI18n } from '../../../../lib/i18n-context';
import { usePermissions } from '../../../../lib/permissions-context';
import { PermissionGate } from '../../../../components/ui/PermissionGate';
import { Spinner } from '../../../../components/ui/Spinner';
import {
  getIdeasByChannel,
  regenerateChannelIdeas,
  type ContentIdea,
} from '../../../../lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

function IdeasTabContent() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const { hasPermission } = usePermissions();
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  const channelId = params.id as string;

  useEffect(() => {
    loadIdeas();
  }, [channelId]);

  async function loadIdeas() {
    setLoading(true);
    try {
      const data = await getIdeasByChannel(channelId);
      setIdeas(data);
    } catch (err) {
      console.error('Failed to load ideas:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    setRegenerating(true);
    try {
      const newIdeas = await regenerateChannelIdeas(channelId);
      setIdeas([...ideas, ...newIdeas]);
    } catch (err) {
      console.error('Failed to regenerate ideas:', err);
    } finally {
      setRegenerating(false);
    }
  }

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

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      idea: t.youtube.statusIdea,
      scripted: t.youtube.statusScripted,
      filmed: t.youtube.statusFilmed,
      published: t.youtube.statusPublished,
      analyzed: t.youtube.statusAnalyzed,
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-slate-500 dark:text-slate-400">
          {ideas.length} {t.youtube.ideas.toLowerCase()}
        </p>
        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="btn-secondary text-sm"
        >
          {regenerating ? t.youtube.generating : t.youtube.generateIdeas}
        </button>
      </div>

      {ideas.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <p className="mb-4">{t.youtube.noIdeas}</p>
          <button onClick={handleRegenerate} className="btn-primary">
            {t.youtube.generateIdeas}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ideas.map((idea) => (
            <div 
              key={idea.id} 
              className="card p-5 cursor-pointer hover:border-sky-300 dark:hover:border-sky-700 transition-colors"
              // @ts-expect-error - typedRoutes has issues with dynamic params
              onClick={() => router.push(`/admin/youtube/${channelId}/ideas/${idea.id}`)}
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2">{idea.title}</h3>
                <span className={`text-[10px] px-2 py-1 rounded ${getIdeaStatusBadge(idea.status)}`}>
                  {getStatusLabel(idea.status)}
                </span>
              </div>
              {idea.hook && (
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                  {idea.hook}
                </p>
              )}
              <div className="flex gap-2 flex-wrap">
                {idea.tags?.slice(0, 3).map((kw) => (
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

export default function ChannelIdeasPage() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('youtube')) {
    return null;
  }

  return (
    <PermissionGate module="youtube">
      <IdeasTabContent />
    </PermissionGate>
  );
}
