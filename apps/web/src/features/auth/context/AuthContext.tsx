import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from "react";
import type { User } from "@workshop/shared";
import * as api from "../../../lib/api";

type AuthContextType = {
  user: User | null;
  ready: boolean; // false until the initial /me check resolves
  signup: (email: string, password: string) => Promise<void>;
  confirmEmail: (email: string, code: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api
      .getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const signup = useCallback(async (email: string, password: string) => {
    await api.signup({ email, password });
  }, []);

  const confirmEmail = useCallback(async (email: string, code: string) => {
    await api.confirmEmail({ email, code });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await api.logout();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, signup, confirmEmail, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
