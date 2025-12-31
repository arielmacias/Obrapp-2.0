import { createContext, useContext, useMemo, useState } from 'react';
import apiClient from '../api/client';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async ({ email, password }) => {
    setIsLoading(true);
    try {
      const data = await apiClient.login({ email, password });
      setToken(data.token);
      return { ok: true };
    } catch (error) {
      return { ok: false, message: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => setToken(null);

  const value = useMemo(() => ({ token, isAuthenticated: Boolean(token), isLoading, login, logout }), [
    token,
    isLoading
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};
