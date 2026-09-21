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
      // The server answered with a client error (wrong password, rate limit, deactivated…): retrying can't help.
      // No answer at all, or a 5xx, is the sleeping/restarting-server case worth retrying.
      const definitive = status !== undefined && status < 500;
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
    // A cold-starting backend can drop the very first request; retry instead of telling the user it failed.
    const { user: loggedInUser, accessToken } = await withRetry(() => authService.login({ email, password }), 3);
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
