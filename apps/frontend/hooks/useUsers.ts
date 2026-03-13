'use client';

import { useState, useEffect, useCallback } from 'react';
import { useI18n } from '../lib/i18n-context';
import { type User, type AdminOption, getHeaders } from '../components/users/constants';

interface UseUsersOptions {
  authLoading: boolean;
  user: { role: string } | null;
}

interface UseUsersReturn {
  users: User[];
  admins: AdminOption[];
  loading: boolean;
  load: () => Promise<void>;
  loadAdmins: () => Promise<void>;
  toggleUser: (id: string, isActive: boolean) => Promise<void>;
  createUser: (data: { name: string; email: string; password: string; role: User['role']; adminId?: string }) => Promise<{ success: boolean; error?: string }>;
  setPermission: (userId: string, key: string, granted: boolean) => Promise<void>;
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
  const [admins, setAdmins] = useState<AdminOption[]>([]);
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

  const loadAdmins = useCallback(async () => {
    try {
      const res = await fetch('/api/users/admins', { headers: getHeaders() });
      if (res.ok) {
        const data = (await res.json()) as AdminOption[];
        setAdmins(data);
      }
    } catch {
      setAdmins([]);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      void load();
      void loadAdmins();
    }
  }, [authLoading, load, loadAdmins]);

  async function toggleUser(id: string, isActive: boolean) {
    try {
      await fetch(`/api/users/${id}/active`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ isActive }),
      });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
    } catch {
      // ignore
    }
  }

  async function createUser(data: { name: string; email: string; password: string; role: User['role']; adminId?: string }) {
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

  async function setPermission(userId: string, key: string, granted: boolean) {
    try {
      const res = await fetch(`/api/users/${userId}/permissions`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ key, granted }),
      });
      if (res.ok) {
        const modules = (await res.json()) as string[];
        setUsers(prev => prev.map(u => 
          u.id === userId ? { ...u, allowedModules: modules } : u
        ));
      }
    } catch {
      // ignore
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
    admins,
    loading,
    load,
    loadAdmins,
    toggleUser,
    createUser,
    setPermission,
    counts,
  };
}
