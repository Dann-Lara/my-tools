'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '../../../components/ui/DashboardLayout';
import { useI18n } from '../../../lib/i18n-context';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../lib/permissions-context';
import { PermissionGate } from '../../../components/ui/PermissionGate';
import { Spinner } from '../../../components/ui/Spinner';
import {
  getNiches,
  getChannels,
  createChannel,
  type Niche,
  type Channel,
  type CreateChannelDto,
} from '../../../lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

function YoutubeDashboardContent() {
  const { t } = useI18n();
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const [view, setView] = useState<'niches' | 'channels'>('niches');
  const [niches, setNiches] = useState<Niche[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingNiches, setGeneratingNiches] = useState(false);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [hoveredNiche, setHoveredNiche] = useState<Niche | null>(null);
  const [creatingChannel, setCreatingChannel] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');

  useEffect(() => {
    if (!hasPermission('youtube')) {
      router.push('/admin');
      return;
    }
    loadData();
  }, [view]);

  async function loadData() {
    setLoading(true);
    try {
      if (view === 'niches') {
        const data = await getNiches();
        const sorted = [...data.niches].sort((a, b) => b.opportunityScore - a.opportunityScore);
        setNiches(sorted);
      } else {
        const data = await getChannels();
        setChannels(data);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
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

  async function handleCreateChannel() {
    if (!selectedNiche || !channelName.trim()) return;
    setCreatingChannel(true);
    try {
      const dto: CreateChannelDto = {
        nicheId: selectedNiche.slug,
        name: channelName,
        description: channelDescription,
      };
      const newChannel = await createChannel(dto);
      setChannels([newChannel, ...channels]);
      setView('channels');
      setSelectedNiche(null);
      setChannelName('');
      setChannelDescription('');
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

  const topNiches = niches; // Show all niches in chart

  return (
    <div className="max-w-[1400px] mx-auto px-6 md:px-12 pt-8 pb-16">
      <div className="py-10 border-b border-slate-200 dark:border-slate-800/60 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <p className="font-mono text-[10px] text-slate-400 uppercase tracking-[0.4em]">
            {t.youtube.title}
          </p>
          <h1 className="headline text-4xl md:text-6xl text-slate-900 dark:text-white">
            <span>{t.youtube.subtitle.split(' ')[0]}</span><br/>
            <span className="text-sky-600 dark:text-sky-400">{t.youtube.subtitle.split(' ').slice(1).join(' ')}</span>
          </h1>
        </div>
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800/60">
        <button
          onClick={() => setView('niches')}
          className={`pb-3 px-1 font-mono text-[11px] uppercase tracking-widest transition-colors
            ${view === 'niches'
              ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          {t.youtube.niches}
        </button>
        <button
          onClick={() => setView('channels')}
          className={`pb-3 px-1 font-mono text-[11px] uppercase tracking-widest transition-colors
            ${view === 'channels'
              ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
        >
          {t.youtube.myChannels}
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span className="w-4 h-4 border-2 border-slate-300 dark:border-slate-700 border-t-red-500 rounded-full animate-spin" />
            {t.youtube.loading}
          </div>
        </div>
      )}

      {!loading && view === 'niches' && (
        <div className="space-y-6">
          {niches.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                {t.youtube.topNiches}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {t.youtube.topNichesDescription}
              </p>
              
              <div className="card p-4 overflow-hidden">
                <div className="relative h-48">
                  <svg className="w-full h-full" viewBox={`0 0 ${niches.length * 100} 180`} preserveAspectRatio="none">
                    <defs>
                      <marker id="dot" markerWidth="8" markerHeight="8" refX="4" refY="4">
                        <circle cx="4" cy="4" r="3" fill="currentColor" className="text-sky-500" />
                      </marker>
                    </defs>
                    
                    <line x1="0" y1="20" x2={niches.length * 100} y2="20" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
                    <line x1="0" y1="65" x2={niches.length * 100} y2="65" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
                    <line x1="0" y1="110" x2={niches.length * 100} y2="110" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
                    <line x1="0" y1="155" x2={niches.length * 100} y2="155" stroke="currentColor" className="text-slate-200 dark:text-slate-700" strokeWidth="1" />
                    
                    <text x="0" y="18" fontSize="8" fill="currentColor" className="text-slate-400">100</text>
                    <text x="0" y="63" fontSize="8" fill="currentColor" className="text-slate-400">75</text>
                    <text x="0" y="108" fontSize="8" fill="currentColor" className="text-slate-400">50</text>
                    <text x="0" y="153" fontSize="8" fill="currentColor" className="text-slate-400">25</text>
                    <text x="0" y="175" fontSize="8" fill="currentColor" className="text-slate-400">0</text>
                    
                    <polyline
                      fill="none"
                      stroke="currentColor"
                      className="text-sky-500"
                      strokeWidth="2"
                      points={niches.map((n, i) => `${i * 100 + 50},${180 - (n.opportunityScore * 1.8)}`).join(' ')}
                    />
                    
                    {niches.map((niche, i) => (
                      <g key={niche.slug}>
                        <circle
                          cx={i * 100 + 50}
                          cy={180 - (niche.opportunityScore * 1.8)}
                          r="6"
                          fill="currentColor"
                          className={`cursor-pointer transition-all duration-200 ${
                            hoveredNiche?.slug === niche.slug
                              ? 'text-sky-600 dark:text-sky-300 scale-125'
                              : 'text-sky-500 dark:text-sky-400'
                          }`}
                          onMouseEnter={() => setHoveredNiche(niche)}
                          onMouseLeave={() => setHoveredNiche(null)}
                          onClick={() => setSelectedNiche(niche)}
                        />
                      </g>
                    ))}
                  </svg>
                  
                  {hoveredNiche && (
                    <div 
                      className="absolute z-10 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-lg p-3 shadow-xl border border-slate-700 pointer-events-none"
                      style={{
                        left: `${niches.findIndex(n => n.slug === hoveredNiche.slug) * 16.66 + 8}%`,
                        top: '0',
                        transform: 'translateX(-50%)'
                      }}
                    >
                      <p className="font-semibold mb-1">{hoveredNiche.name}</p>
                      <p className="text-sky-400 font-mono text-lg">{hoveredNiche.opportunityScore}</p>
                      <p className="text-slate-400 text-[10px] mt-1">{hoveredNiche.description?.slice(0, 50)}</p>
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {hoveredNiche.topKeywords?.slice(0, 3).map((kw) => (
                          <span key={kw} className="text-[9px] px-1.5 py-0.5 bg-slate-700 rounded">{kw}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between mt-2 px-2">
                  {niches.map((niche, i) => (
                    <span 
                      key={niche.slug}
                      className={`text-[10px] font-mono cursor-pointer transition-colors ${
                        hoveredNiche?.slug === niche.slug 
                          ? 'text-sky-600 dark:text-sky-300 font-semibold' 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                      onMouseEnter={() => setHoveredNiche(niche)}
                      onMouseLeave={() => setHoveredNiche(null)}
                    >
                      #{i + 1}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {niches.map((niche) => (
              <div
                key={niche.slug}
                className="card p-5 hover:border-sky-300 dark:hover:border-sky-700/50 transition-colors cursor-pointer"
                onClick={() => setSelectedNiche(niche)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-slate-900 dark:text-white">{niche.name}</h3>
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
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && view === 'channels' && (
        <div className="space-y-4">
          {channels.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="mb-4">{t.youtube.noChannels}</p>
              <button
                onClick={() => setView('niches')}
                className="btn-primary"
              >
                {t.youtube.chooseNiche}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <div key={channel.id} className="card p-5">
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
      )}

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

export default function AdminYoutubePage() {
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <DashboardLayout variant="admin" user={user} title="YouTube Channel Hack">
      <PermissionGate module="youtube">
        <YoutubeDashboardContent />
      </PermissionGate>
    </DashboardLayout>
  );
}
