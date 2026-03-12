'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../lib/i18n-context';
import { type User, getHeaders } from '../components/users/constants';

interface UseUsersOptions {
  authLoading: boolean;
  user: { role: string } | null;
}

interface UseUsersReturn {
  users: User[];
  loading: boolean;
  load: () => Promise<void>;
  toggleUser: (id: string, isActive: boolean) => Promise<void>;
  createUser: (data: { name: string; email: string; password: string; role: User['role'] }) => Promise<{ success: boolean; error?: string }>;
  counts: {
    total: number;
    active: number;
    superadmin: number;
    admin: number;
    client: number;
  };
}

export function useUsers({ authLoading, user }: UseUsersOptions): UseUsersReturn {
  const { t } = useI18n();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users', { headers: getHeaders() });
      const data = (await res.json()) as User[];
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      void load();
    }
  }, [authLoading, load]);

  async function toggleUser(id: string, isActive: boolean) {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive }),
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
    } catch {
      // ignore
    }
  }

  async function createUser(data: { name: string; email: string; password: string; role: User['role'] }) {
    if (!data.name || !data.email || !data.password) {
      return { success: false, error: t.checklist.errorRequiredFields };
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = (await res.json()) as { message?: string };
        return { success: false, error: d.message ?? t.common.error };
      }
      await load();
      return { success: true };
    } catch {
      return { success: false, error: t.common.error };
    }
  }

  const counts = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    superadmin: users.filter(u => u.role === 'superadmin').length,
    admin: users.filter(u => u.role === 'admin').length,
    client: users.filter(u => u.role === 'client').length,
  };

  return {
    users,
    loading,
    load,
    toggleUser,
    createUser,
    counts,
  };
}
