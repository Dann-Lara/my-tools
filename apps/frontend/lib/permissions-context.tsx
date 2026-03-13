'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { AuthUser } from './auth';

export type PermissionsMap = Record<string, boolean>;

interface PermissionsContextValue {
  permissions: PermissionsMap;
  ready: boolean;
  hasPermission: (key: string) => boolean;
  invalidate: () => void;
}

export const PermissionsContext = createContext<PermissionsContextValue>({
  permissions: {},
  ready: false,
  hasPermission: () => false,
  invalidate: () => {},
});

// ─────────────────────────────────────────────────────────────────────────────
export function PermissionsProvider({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const [permissions, setPermissions] = useState<PermissionsMap>({});
  const [ready, setReady] = useState(false);

  const userId = user.userId;
  const fetchedFor = useRef('');


  function doFetch() {
    if (!userId) {
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('ailab_at') : null;

    if (!token) {
      setPermissions({});
      setReady(true);
      return;
    }

    fetchedFor.current = userId;
    setReady(false);

    fetch('/api/users/me/permissions', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PermissionsMap>;
      })
      .then((data) => {
        // Backend now returns { checklist: true, applications: false, ai: true }
        setPermissions(data);
        setReady(true);
      })
      .catch((err) => {
        console.error('[Permissions] Error fetching:', err);
        // On error, superadmin/admin get full access, client gets nothing
        const currentRole = user?.role;
        const fallback = (currentRole === 'superadmin' || currentRole === 'admin')
          ? { checklist: true, applications: true, ai: true } as PermissionsMap
          : {} as PermissionsMap;
        setPermissions(fallback);
        setReady(true);
      });
  }

  useEffect(() => {
    if (!userId) {
      setPermissions({});
      setReady(false);
      fetchedFor.current = '';
      return;
    }
    if (fetchedFor.current === userId) {
      return;
    }
    doFetch();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Single function: uses real permissions from backend
  // Superadmin and admin always have full access (backend returns all true anyway)
  // Client depends on their allowedModules from the backend
  function hasPermission(key: string): boolean {
    // Use current user.role directly, not the captured constant
    const currentRole = user?.role;
    // Superadmin and admin always have full access
    if (currentRole === 'superadmin' || currentRole === 'admin') {
      return true;
    }
    // Client depends on permissions fetch
    const result = ready && permissions[key] === true;
    return result;
  }

  function invalidate() {
    fetchedFor.current = '';
    doFetch();
  }

  return (
    <PermissionsContext.Provider value={{ permissions, ready, hasPermission, invalidate }}>
      {children}
    </PermissionsContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export function usePermissions(): PermissionsContextValue {
  return useContext(PermissionsContext);
}

/** Backwards compat shim */
export function invalidatePermissionsCache(): void { /* no-op */ }
