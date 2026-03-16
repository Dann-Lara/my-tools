'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';

const ADMIN_ROLES = ['superadmin', 'admin'];

export default function AdminYoutubePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth(ADMIN_ROLES);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace('/client/youtube');
    }
  }, [authLoading, user, router]);

  return null;
}
