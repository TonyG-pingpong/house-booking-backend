import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { AuthProfile } from '../types';
import * as api from '../api';
import { getStoredToken, setStoredToken, clearStoredToken } from '../storage';

interface AuthContextValue {
  user: AuthProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { access_token } = await api.login(email, password);
      await setStoredToken(access_token);
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    }
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      const { access_token } = await api.signup(email, password);
      await setStoredToken(access_token);
      const profile = await api.getProfile();
      setUser(profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
      throw err;
    }
  }, []);

  const logout = useCallback(async () => {
    await clearStoredToken();
    setUser(null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = await getStoredToken();
      if (!token || cancelled) {
        setLoading(false);
        return;
      }
      try {
        const profile = await api.getProfile();
        if (!cancelled) setUser(profile);
      } catch {
        await clearStoredToken();
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const value: AuthContextValue = {
    user,
    loading,
    login,
    signup,
    logout,
    error,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
