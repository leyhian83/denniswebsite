import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { AUTH } from "../config/auth";

/**
 * MVP client-side authentication.
 *
 * The session is kept in sessionStorage so a refresh stays logged in, but a
 * closed tab logs out. This is a prototype gate, not real security — swap for
 * a backend session when deploying.
 */
const STORAGE_KEY = "leyhi.admin.authed";

interface AuthContextValue {
  isAuthed: boolean;
  login: (userId: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readInitial(): boolean {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState<boolean>(readInitial);

  const login = useCallback((userId: string, password: string) => {
    const ok = userId === AUTH.userId && password === AUTH.password;
    if (ok) {
      setIsAuthed(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore storage errors */
      }
    }
    return ok;
  }, []);

  const logout = useCallback(() => {
    setIsAuthed(false);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const value = useMemo(
    () => ({ isAuthed, login, logout }),
    [isAuthed, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
