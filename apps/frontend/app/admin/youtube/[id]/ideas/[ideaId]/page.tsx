'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useAuth } from '@/hooks/useAuth';
import { PermissionGate } from '@/components/ui/PermissionGate';
import { Spinner } from '@/components/ui/Spinner';
import {
  getIdeaById,
  generateIdeaScript,
  updateIdeaStatus,
  type ContentIdea,
  type IdeaStatus,
} from '@/lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

function IdeaDetailContent() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const [idea, setIdea] = useState<ContentIdea | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const ideaId = params.ideaId as string;
  const channelId = params.id as string;

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadIdea();
  }, [ideaId, authLoading, user]);

  async function loadIdea() {
    setLoading(true);
    try {
      const data = await getIdeaById(ideaId);
      setIdea(data);
    } catch (err) {
      console.error('Failed to load idea:', err);
      // @ts-expect-error - typedRoutes has issues with dynamic params
      router.push(`/admin/youtube/${channelId}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateScript() {
    setGeneratingScript(true);
    try {
      const updated = await generateIdeaScript(ideaId);
      setIdea(updated);
    } catch (err) {
      console.error('Failed to generate script:', err);
    } finally {
      setGeneratingScript(false);
    }
  }

  async function handleStatusChange(status: IdeaStatus) {
    try {
      const updated = await updateIdeaStatus(ideaId, { status });
      setIdea(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  }

  async function copyToClipboard(text: string, type: string) {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 1500);
  }

  const getStatusBadge = (status: string) => {
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

  if (!idea) return null;

  return (
    <div>
      <button
        // @ts-expect-error - typedRoutes has issues with dynamic params
        onClick={() => router.push(`/admin/youtube/${channelId}`)}
        className="mb-6 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 flex items-center gap-2"
      >
        &larr; {t.youtube.ideas}
      </button>

      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {idea.title}
          </h1>
          <span className={`text-xs px-3 py-1.5 rounded ${getStatusBadge(idea.status)}`}>
            {getStatusLabel(idea.status)}
          </span>
        </div>
        <div className="flex gap-2">
          <select
            value={idea.status}
            onChange={(e) => handleStatusChange(e.target.value as IdeaStatus)}
            className="input text-sm"
          >
            <option value="idea">{t.youtube.statusIdea}</option>
            <option value="scripted">{t.youtube.statusScripted}</option>
            <option value="filmed">{t.youtube.statusFilmed}</option>
            <option value="published">{t.youtube.statusPublished}</option>
            <option value="analyzed">{t.youtube.statusAnalyzed}</option>
          </select>
        </div>
      </div>

      {idea.hook && (
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {t.youtube.hook}
            </h2>
            <button
              onClick={() => copyToClipboard(idea.hook!, 'hook')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              {copied === 'hook' ? t.youtube.copied : t.youtube.copyHook}
            </button>
          </div>
          <p className="text-slate-700 dark:text-slate-300 text-lg">{idea.hook}</p>
        </div>
      )}

      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t.youtube.script}
          </h2>
          {idea.script ? (
            <button
              onClick={() => copyToClipboard(idea.script!, 'script')}
              className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              {copied === 'script' ? t.youtube.copied : t.youtube.copyScript}
            </button>
          ) : null}
        </div>
        
        {!idea.script ? (
          <div className="text-center py-8">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              {t.youtube.scriptGenerated}
            </p>
            <button
              onClick={handleGenerateScript}
              disabled={generatingScript}
              className="btn-primary"
            >
              {generatingScript ? t.youtube.generatingScript : t.youtube.generateScript}
            </button>
          </div>
        ) : (
          <div className="prose dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300 font-sans">
              {idea.script}
            </pre>
          </div>
        )}
      </div>

      {idea.seoTitle && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            SEO
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                {t.youtube.seoTitle}
              </p>
              <p className="text-slate-900 dark:text-white">{idea.seoTitle}</p>
            </div>
            {idea.seoDescription && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                  Description
                </p>
                <p className="text-slate-700 dark:text-slate-300">{idea.seoDescription}</p>
              </div>
            )}
            {idea.tags && idea.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {idea.tags.map((tag) => (
                  <span key={tag} className="text-xs px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function IdeaDetailPage() {
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <PermissionGate module="youtube">
      <IdeaDetailContent />
    </PermissionGate>
  );
}
