"use client";

import { useCallback, useEffect, useState } from "react";
import { adminApi, clearToken, getToken, setToken } from "@/lib/adminApi";

export type AuthStatus = "checking" | "authed" | "unauthed";

export interface AdminAuth {
  status: AuthStatus;
  signIn: (token: string) => Promise<boolean>;
  signOut: () => void;
}

/**
 * useAdminAuth verifies the stored admin token against the backend on mount
 * and exposes sign-in / sign-out. The token lives only in sessionStorage
 * (this is a self-hosted, single-admin tool).
 */
export function useAdminAuth(): AdminAuth {
  const [status, setStatus] = useState<AuthStatus>("checking");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("unauthed");
      return;
    }
    let alive = true;
    adminApi
      .verify(token)
      .then((ok) => alive && setStatus(ok ? "authed" : "unauthed"))
      .catch(() => alive && setStatus("unauthed"));
    return () => {
      alive = false;
    };
  }, []);

  const signIn = useCallback(async (token: string) => {
    const ok = await adminApi.verify(token.trim()).catch(() => false);
    if (ok) {
      setToken(token.trim());
      setStatus("authed");
    }
    return ok;
  }, []);

  const signOut = useCallback(() => {
    clearToken();
    setStatus("unauthed");
  }, []);

  return { status, signIn, signOut };
}
