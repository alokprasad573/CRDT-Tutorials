"use client";

import { useState, useEffect } from "react";
import { authApi } from "@/lib/api";

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function checkAuth() {
      try {
        const res = await authApi.me();
        if (!ignore) {
          if (res.success && res.data?.user) {
            setUser(res.data.user);
          } else {
            setUser(null);
          }
        }
      } catch {
        if (!ignore) {
          setUser(null);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }
    checkAuth();
    return () => {
      ignore = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return { success: true as const, user: res.data.user };
    }
    return { success: false as const, error: res.error };
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register(name, email, password);
    if (res.success && res.data?.user) {
      setUser(res.data.user);
      return { success: true as const, user: res.data.user };
    }
    return { success: false as const, error: res.error };
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  return { user, loading, login, register, logout };
}
