import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { loginRequest, meRequest } from "../api/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const hydrate = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { user: currentUser } = await meRequest();
      setUser(currentUser);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const login = async (payload) => {
    setAuthError("");
    const { token, user: loggedUser } = await loginRequest(payload);
    localStorage.setItem("token", token);
    setUser(loggedUser);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      authError,
      setAuthError,
      login,
      logout,
    }),
    [user, loading, authError, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
