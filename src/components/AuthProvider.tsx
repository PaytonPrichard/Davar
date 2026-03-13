"use client";

import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useCloudSync } from "@/hooks/useCloudSync";
import type { User } from "@supabase/supabase-js";

interface AuthContextValue {
  user: User | null;
  isSignedIn: boolean;
  loading: boolean;
  configured: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  syncStatus: "idle" | "syncing" | "synced" | "error" | "conflict";
  lastSynced: string | null;
  syncError: string | null;
  triggerSync: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const cloudSync = useCloudSync(auth.user);

  return (
    <AuthContext.Provider
      value={{
        user: auth.user,
        isSignedIn: auth.isSignedIn,
        loading: auth.loading,
        configured: auth.configured,
        signInWithGoogle: auth.signInWithGoogle,
        signInWithEmail: auth.signInWithEmail,
        signOut: auth.signOut,
        syncStatus: cloudSync.status,
        lastSynced: cloudSync.lastSynced,
        syncError: cloudSync.error,
        triggerSync: cloudSync.sync,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside <AuthProvider>");
  return ctx;
}
