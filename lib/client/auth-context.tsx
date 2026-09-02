"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import type { User } from "@/lib/types";
import { api, AUTH_LOGOUT_EVENT } from "@/lib/client/api";
import { clearSession, getStoredUser, hydrate, setSession } from "@/lib/client/token-store";

// PROVIDED IN FULL. Sign-in already works end to end — you shouldn't need to touch this file.
// It's here as a reference for how a React context + custom hook fit together.

interface AuthContextValue {
  user: User | null;
  /** True once we've read localStorage. Guards against a flash of the wrong UI on first paint. */
  ready: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    hydrate();
    setUser(getStoredUser<User>());
    setReady(true);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    setUser(null);
    router.replace("/signin");
  }, [router]);

  // api.ts fires this event if the server ever rejects our token.
  useEffect(() => {
    const handler = () => logout();
    window.addEventListener(AUTH_LOGOUT_EVENT, handler);
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, handler);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.post<{ token: string; user: User }>("/api/auth/login", {
      email,
      password,
    });
    setSession(res.token, res.user);
    setUser(res.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, ready, login, logout }),
    [user, ready, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
