'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui/Spinner';
import { getChannels } from '@/lib/youtube';

const ALLOWED_ROLES = ['superadmin', 'admin', 'client'];

export default function YoutubeIndexPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(ALLOWED_ROLES);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    async function checkChannels() {
      try {
        const channels = await getChannels();
        if (channels.length > 0) {
          // @ts-expect-error - typedRoutes has issues with new routes
          router.push('/admin/youtube/channels');
        } else {
          // @ts-expect-error - typedRoutes has issues with new routes
          router.push('/admin/youtube/niches');
        }
      } catch (err) {
        console.error('Failed to check channels:', err);
        // @ts-expect-error - typedRoutes has issues with new routes
        router.push('/admin/youtube/niches');
      } finally {
        setChecking(false);
      }
    }

    checkChannels();
  }, [authLoading, user, router]);

  if (authLoading || checking) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return null;
}
