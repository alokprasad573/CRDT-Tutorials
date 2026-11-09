"use client";

import { createContext, useContext, ReactNode, useCallback } from "react";
import { useAuth, type User } from "@/lib/auth";

const AuthContext = createContext<{
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: { code: string; message: string } }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; user?: User; error?: { code: string; message: string } }>;
  logout: () => Promise<void>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, loading, login, register, logout } = useAuth();

  const value = useCallback(
    () => ({ user, loading, login, register, logout }),
    [user, loading, login, register, logout]
  )();

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAppAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAppAuth must be used within an AuthProvider");
  }
  return ctx;
}
