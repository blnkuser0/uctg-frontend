"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { setAccessToken } from "@/lib/auth-token";
import * as authService from "@/services/auth.service";
import { User } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refetchMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// The backend can be asleep or restarting (free hosting spins down when idle) and
// answer the first request with a timeout or 5xx. That is not "logged out": retry
// a few times, and only give up immediately on a real 401/403.
async function withRetry<T>(fn: () => Promise<T>, attempts = 4): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      const definitive = status === 401 || status === 403 || status === 400;
      if (definitive || attempt >= attempts) throw error;
      await sleep(1500 * attempt);
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refetchMe = useCallback(async () => {
    const me = await authService.getMe();
    setUser(me);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      try {
        // Silently exchange the httpOnly refresh cookie (if any) for a fresh access token.
        const res = await withRetry(() => apiClient.post("/auth/refresh-tokens"));
        const accessToken: string | null = res.data?.data?.accessToken ?? null;
        if (!accessToken) throw new Error("No access token");
        setAccessToken(accessToken);

        const me = await withRetry(() => authService.getMe());
        if (!cancelled) setUser(me);
      } catch {
        if (!cancelled) {
          setAccessToken(null);
          setUser(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, accessToken } = await authService.login({ email, password });
    setAccessToken(accessToken);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
