import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../lib/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const data = await api.me();
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const data = await api.login(email, password);
    setUser(data);
    return data;
  };

  const register = async (email, fullName, password) => {
    const data = await api.register(email, fullName, password);
    setUser(data);
    return data;
  };

  const doLogout = async () => {
    await api.logout();
    setUser(null);
  };

  const refresh = async () => {
    await api.refresh();
    await loadUser();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout: doLogout,
    refresh,
    reload: loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}