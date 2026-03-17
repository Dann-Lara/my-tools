'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useI18n } from '../../../../lib/i18n-context';
import { usePermissions } from '../../../../lib/permissions-context';
import {
  getChannelById,
  type Channel,
} from '../../../../lib/youtube';
import { Spinner } from '../../../../components/ui/Spinner';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

export default function ChannelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { hasPermission } = usePermissions();
  const [channel, setChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);

  const channelId = params.id as string;

  useEffect(() => {
    if (!hasPermission('youtube')) {
      router.push('/admin');
      return;
    }
    loadChannel();
  }, [channelId]);

  async function loadChannel() {
    try {
      const data = await getChannelById(channelId);
      setChannel(data);
    } catch (err) {
      console.error('Failed to load channel:', err);
      router.push('/admin/youtube');
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    { href: `/admin/youtube/${channelId}/`, label: t.youtube.ideas, exact: true },
    { href: `/admin/youtube/${channelId}/prompts`, label: t.youtube.promptsIA, exact: false },
    { href: `/admin/youtube/${channelId}/monetization`, label: t.youtube.monetization, exact: true },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
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
        &larr; {t.youtube.backToChannels}
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
          <StatusBadge status={channel.status} t={t} />
        </div>
        {channel.description && (
          <p className="mt-4 text-slate-500 dark:text-slate-400 max-w-2xl">
            {channel.description}
          </p>
        )}
      </div>

      <div className="flex gap-4 mb-8 border-b border-slate-200 dark:border-slate-800/60 overflow-x-auto">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`pb-3 px-1 font-mono text-[11px] uppercase tracking-widest whitespace-nowrap transition-colors
              ${isActive(tab.href, tab.exact)
                ? 'text-sky-600 dark:text-sky-400 border-b-2 border-sky-600 dark:border-sky-400'
                : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {children}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const styles: Record<string, string> = {
    setup: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
    active: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300',
    paused: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    monetized: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
  };

  const labels: Record<string, string> = {
    setup: t.youtube.statusSetup,
    active: t.youtube.statusActive,
    paused: t.youtube.statusPaused,
    monetized: t.youtube.statusMonetized,
  };

  return (
    <span className={`text-xs px-3 py-1.5 rounded ${styles[status] || styles.setup}`}>
      {labels[status] || status}
    </span>
  );
}
