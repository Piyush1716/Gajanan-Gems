import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { loginUser, signupUser } from "@/services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

export type User = {
  id: number;
  email: string;
  phone: string;
  first_name: string | null;
  last_name: string | null;
};

type AuthCtx = {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { email: string; phone: string; password: string; firstName?: string; lastName?: string }) => Promise<boolean>;
  logout: () => void;
  // Modal control
  loginModalOpen: boolean;
  showLoginModal: (onSuccess?: () => void) => void;
  hideLoginModal: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);
const STORAGE_KEY = "gajanangems_user_v1";

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.id && parsed?.email) {
          return parsed;
        }
      }
    } catch {
      // Invalid data — clear it
      if (typeof window !== "undefined") {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    return null;
  });
  
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState<(() => void) | null>(null);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        if (user) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {}
  }, [user]);

  // ── Login ───────────────────────────────────────────────────────────────────

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    console.log(`[auth] Attempting login for: ${email}`);
    const { data, error } = await loginUser(email.trim().toLowerCase(), password);

    if (error || !data?.user) {
      console.error("[auth] Login failed:", error);
      toast.error(error || "Invalid email or password. Please try again.");
      return false;
    }

    const userData: User = {
      id: data.user.id,
      email: data.user.email,
      phone: data.user.phone,
      first_name: data.user.first_name,
      last_name: data.user.last_name,
    };

    setUser(userData);
    console.log(`[auth] Login successful for: ${email}`);
    toast.success(`Welcome back${data.user.first_name ? `, ${data.user.first_name}` : ""}! 🎉`);

    // Close modal and trigger callback
    setLoginModalOpen(false);
    if (onSuccessCallback) {
      // Run callback after a short delay to let the modal close
      setTimeout(() => {
        onSuccessCallback();
        setOnSuccessCallback(null);
      }, 150);
    }

    return true;
  }, [onSuccessCallback]);

  // ── Signup ──────────────────────────────────────────────────────────────────

  const signup = useCallback(async (data: {
    email: string;
    phone: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<boolean> => {
    console.log(`[auth] Attempting signup for: ${data.email}`);

    const { data: resData, error } = await signupUser({
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      password: data.password,
      first_name: data.firstName ? DOMPurify.sanitize(data.firstName.trim()) : null,
      last_name: data.lastName ? DOMPurify.sanitize(data.lastName.trim()) : null,
    });

    if (error || !resData?.user) {
      console.error("[auth] Signup failed:", error);
      toast.error(error || "Failed to create account. Please try again.");
      return false;
    }

    const newUser = resData.user;

    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      phone: newUser.phone,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
    };

    setUser(userData);
    console.log(`[auth] Signup successful for: ${data.email}`);
    toast.success(`Account created successfully! Welcome${newUser.first_name ? `, ${newUser.first_name}` : ""}! 🎉`);

    // Close modal and trigger callback
    setLoginModalOpen(false);
    if (onSuccessCallback) {
      setTimeout(() => {
        onSuccessCallback();
        setOnSuccessCallback(null);
      }, 150);
    }

    return true;
  }, [onSuccessCallback]);

  // ── Logout ──────────────────────────────────────────────────────────────────

  const logout = useCallback(() => {
    setUser(null);
    toast.success("You've been logged out.");
  }, []);

  // ── Modal control ───────────────────────────────────────────────────────────

  const showLoginModal = useCallback((onSuccess?: () => void) => {
    if (onSuccess) {
      setOnSuccessCallback(() => onSuccess);
    } else {
      setOnSuccessCallback(null);
    }
    setLoginModalOpen(true);
  }, []);

  const hideLoginModal = useCallback(() => {
    setLoginModalOpen(false);
    setOnSuccessCallback(null);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        signup,
        logout,
        loginModalOpen,
        showLoginModal,
        hideLoginModal,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
