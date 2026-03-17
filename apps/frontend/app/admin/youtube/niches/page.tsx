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
  getNiches,
  deleteNiche,
  type Niche,
  type CreateChannelDto,
} from '../../../../lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

function NichesContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const [niches, setNiches] = useState<Niche[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingNiches, setGeneratingNiches] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    loadNiches();
  }, [authLoading, user]);

  async function loadNiches() {
    setLoading(true);
    try {
      const data = await getNiches();
      const sorted = [...data.niches].sort((a, b) => b.opportunityScore - a.opportunityScore);
      setNiches(sorted);
    } catch (err) {
      console.error('Failed to load niches:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateMoreNiches() {
    setGeneratingNiches(true);
    try {
      const data = await getNiches();
      const sorted = [...data.niches].sort((a, b) => b.opportunityScore - a.opportunityScore);
      setNiches(prev => [...prev, ...sorted]);
    } catch (err) {
      console.error('Failed to generate niches:', err);
    } finally {
      setGeneratingNiches(false);
    }
  }

  async function handleDeleteNiche(nicheId: string) {
    setDeleting(nicheId);
    try {
      await deleteNiche(nicheId);
      setNiches(prev => prev.filter(n => n.id !== nicheId));
      setConfirmDel(null);
    } catch (err) {
      console.error('Failed to delete niche:', err);
    } finally {
      setDeleting(null);
    }
  }

  async function handleCreateChannel() {
    if (!selectedNiche || !channelName.trim()) return;
    setCreatingChannel(true);
    try {
      const dto: CreateChannelDto = {
        nicheId: selectedNiche.slug,
        name: channelName,
        description: channelDescription,
        targetAudience: selectedNiche.suggestedAudience || 'General',
      };
      await fetch('/api/v1/youtube/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dto),
      });
      setSelectedNiche(null);
      setChannelName('');
      setChannelDescription('');
      // @ts-expect-error - typedRoutes has issues with new routes
      router.push('/admin/youtube/channels');
    } catch (err) {
      console.error('Failed to create channel:', err);
    } finally {
      setCreatingChannel(false);
    }
  }

  const getOpportunityColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 60) return 'text-sky-600 dark:text-sky-400';
    if (score >= 40) return 'text-amber-600 dark:text-amber-400';
    return 'text-slate-500';
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
            <span>{t.youtube.niches}</span>
          </h1>
        </div>
        <Link
          // @ts-expect-error - typedRoutes has issues with new routes
          href="/admin/youtube/channels"
          className="btn-secondary"
        >
          {t.youtube.myChannels}
        </Link>
      </div>

      <div className="space-y-6 mb-8">
        <div className="flex justify-between items-center">
          <p className="text-slate-500 dark:text-slate-400">
            {t.youtube.nichesDescription}
          </p>
          <button
            onClick={handleGenerateMoreNiches}
            disabled={generatingNiches}
            className="btn-secondary text-sm"
          >
            {generatingNiches ? t.youtube.generating : t.youtube.generateMore}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {niches.map((niche) => (
          <div
            key={niche.id}
            className="card p-5 hover:border-sky-300 dark:hover:border-sky-700/50 transition-colors cursor-pointer group relative"
            onClick={() => setSelectedNiche(niche)}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-semibold text-slate-900 dark:text-white pr-8">{niche.name}</h3>
              <span className={`font-mono text-lg font-bold ${getOpportunityColor(niche.opportunityScore)}`}>
                {niche.opportunityScore}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
              {niche.description}
            </p>
            <div className="flex gap-2 flex-wrap">
              {niche.topKeywords?.slice(0, 3).map((kw) => (
                <span key={kw} className="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                  {kw}
                </span>
              ))}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirmDel === niche.id) {
                  handleDeleteNiche(niche.id);
                } else {
                  setConfirmDel(niche.id);
                }
              }}
              disabled={deleting === niche.id}
              className={`absolute top-3 right-3 p-2 rounded-lg transition-all ${
                confirmDel === niche.id
                  ? 'bg-rose-500 text-white'
                  : 'opacity-0 group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500'
              }`}
              title={confirmDel === niche.id ? t.youtube.deleteConfirm : t.youtube.deleteNiche}
            >
              {deleting === niche.id ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6" />
                  <path d="M14 11v6" />
                  <path d="M9 6V4h6v2" />
                </svg>
              )}
            </button>

            {confirmDel === niche.id && (
              <div className="absolute left-0 right-0 top-12 bg-white dark:bg-slate-800 shadow-xl rounded-lg p-3 border border-slate-200 dark:border-slate-700 z-10 mx-2">
                <p className="font-mono text-[10px] text-slate-600 dark:text-slate-300 mb-2">
                  {t.youtube.deleteConfirm}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNiche(niche.id);
                    }}
                    className="font-mono text-[9px] px-3 py-1.5 rounded bg-rose-500 hover:bg-rose-600 text-white transition-colors"
                  >
                    {t.youtube.deleteYes}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDel(null);
                    }}
                    className="font-mono text-[9px] px-3 py-1.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  >
                    {t.youtube.deleteNo}
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {selectedNiche && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card p-6 max-w-md w-full">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
              {t.youtube.createChannelIn} "{selectedNiche.name}"
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  {t.youtube.channelName}
                </label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  className="input w-full"
                  placeholder={t.youtube.channelNamePlaceholder}
                />
                {selectedNiche.suggestedChannelName && (
                  <button
                    type="button"
                    onClick={() => setChannelName(selectedNiche.suggestedChannelName || '')}
                    className="mt-2 text-xs text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1"
                  >
                    {t.youtube.useSuggested}: <span className="font-medium">{selectedNiche.suggestedChannelName}</span>
                  </button>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedNiche(null)}
                  className="btn-ghost flex-1"
                  disabled={creatingChannel}
                >
                  {t.youtube.cancel}
                </button>
                <button
                  onClick={handleCreateChannel}
                  className="btn-primary flex-1"
                  disabled={!channelName.trim() || creatingChannel}
                >
                  {creatingChannel ? t.youtube.creating : t.youtube.createChannel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function NichesPage() {
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <DashboardLayout variant="admin" user={user} title="YouTube - Nichos">
      <PermissionGate module="youtube">
        <NichesContent />
      </PermissionGate>
    </DashboardLayout>
  );
}
