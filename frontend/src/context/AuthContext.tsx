import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { loginUser, registerUser } from "../api/authApi";
import { clearStoredToken, storeToken } from "../api/axiosClient";
import type { AuthUser, LoginPayload, RegisterPayload } from "../types";

const USER_STORAGE_KEY = "task_manager_user";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => void;
  updateUser: (patch: Partial<Pick<AuthUser, "username" | "email">>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => readStoredUser());

  const persistSession = (authUser: AuthUser, token: string) => {
    storeToken(token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(authUser));
    setUser(authUser);
  };

  const login = async (payload: LoginPayload) => {
    const response = await loginUser(payload);
    persistSession(
      { userId: response.userId, username: response.username, email: response.email },
      response.token
    );
  };

  const register = async (payload: RegisterPayload) => {
    const response = await registerUser(payload);
    persistSession(
      { userId: response.userId, username: response.username, email: response.email },
      response.token
    );
  };

  const logout = () => {
    clearStoredToken();
    localStorage.removeItem(USER_STORAGE_KEY);
    setUser(null);
  };

  const updateUser = (patch: Partial<Pick<AuthUser, "username" | "email">>) => {
    setUser((current) => {
      if (!current) return current;
      const updated = { ...current, ...patch };
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: !!user, login, register, logout, updateUser }),
    [user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
