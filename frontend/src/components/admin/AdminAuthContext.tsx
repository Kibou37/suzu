'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  adminLogin,
  adminLogout,
  fetchAdminMe,
  getAdminToken,
  type AdminUser,
} from '@/lib/admin-api';

type AdminAuthState = {
  user: AdminUser | null;
  isLoading: boolean;
  login: (login: string, password: string) => Promise<void>;
  logout: () => void;
};

const AdminAuthContext = createContext<AdminAuthState | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!getAdminToken()) {
        setIsLoading(false);
        return;
      }

      try {
        const me = await fetchAdminMe();
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (loginValue: string, password: string) => {
    const { user: loggedInUser } = await adminLogin(loginValue, password);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    adminLogout();
    setUser(null);
  }, []);

  const value = useMemo<AdminAuthState>(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth(): AdminAuthState {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return ctx;
}
