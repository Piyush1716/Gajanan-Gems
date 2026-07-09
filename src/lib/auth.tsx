import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

// ─── Types ────────────────────────────────────────────────────────────────────

// Phone regex: Indian mobile numbers starting with 6-9, exactly 10 digits
const indianPhoneRegex = /^[6-9]\d{9}$/;

export type User = {
  id: string; // UUID from Supabase auth.users
  email: string;
  phone: string | null;
  first_name: string | null;
  last_name: string | null;
};

type AuthCtx = {
  user: User | null;
  session: Session | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: {
    email: string;
    phone: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  // Email confirmation pending state
  pendingEmail: string | null;
  clearPendingEmail: () => void;
  // Modal control
  loginModalOpen: boolean;
  showLoginModal: (onSuccess?: () => void) => void;
  hideLoginModal: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

// ─── Helper: build User from Supabase session + profile ───────────────────────

function buildUser(session: Session): User {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    email: session.user.email ?? "",
    phone: meta.phone ?? null,
    first_name: meta.first_name ?? null,
    last_name: meta.last_name ?? null,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  // true while the initial session is being restored on page load
  const [isLoading, setIsLoading] = useState(true);

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [onSuccessCallback, setOnSuccessCallback] = useState<
    (() => void) | null
  >(null);
  // When set, signup was successful but email confirmation is pending
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  // ── Sync auth state from Supabase SDK ───────────────────────────────────────

  useEffect(() => {
    // 1. Restore existing session on mount (handles page refresh)
    supabase.auth.getSession().then(({ data }) => {
      const s = data.session;
      if (s) {
        setSession(s);
        setUser(buildUser(s));
      }
      setIsLoading(false);
    });

    // 2. Subscribe to auth state changes (login, logout, token refresh, email confirmation)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s ? buildUser(s) : null);
      setIsLoading(false);

      // When user clicks the confirmation link and is redirected back,
      // Supabase fires SIGNED_IN. Clear the pending state and greet them.
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && s) {
        setPendingEmail((prev) => {
          if (prev) {
            // Small delay so the page has time to settle after redirect
            setTimeout(() => {
              const name = s.user.user_metadata?.first_name;
              toast.success(
                `Email confirmed! Welcome${name ? `, ${name}` : ""}! 🎉`
              );
            }, 300);
            return null;
          }
          return prev;
        });
        // Also close the pending screen if modal is still open
        setLoginModalOpen(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // ── Login ───────────────────────────────────────────────────────────────────

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      console.log(`[auth] Attempting login for: ${email}`);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error || !data.session) {
        console.error("[auth] Login failed:", error?.message);

        // Provide friendly messages for common errors
        if (error?.message?.toLowerCase().includes("email not confirmed")) {
          toast.error(
            "Please confirm your email before logging in. Check your inbox."
          );
        } else if (
          error?.message?.toLowerCase().includes("invalid login credentials")
        ) {
          toast.error("Invalid email or password. Please try again.");
        } else {
          toast.error(error?.message ?? "Login failed. Please try again.");
        }
        return false;
      }

      const built = buildUser(data.session);
      console.log(`[auth] Login successful for: ${email}`);
      toast.success(
        `Welcome back${built.first_name ? `, ${built.first_name}` : ""}! 🎉`
      );

      setLoginModalOpen(false);
      if (onSuccessCallback) {
        setTimeout(() => {
          onSuccessCallback();
          setOnSuccessCallback(null);
        }, 150);
      }

      return true;
    },
    [onSuccessCallback]
  );

  // ── Signup ──────────────────────────────────────────────────────────────────

  const signup = useCallback(
    async (data: {
      email: string;
      phone: string;
      password: string;
      firstName?: string;
      lastName?: string;
    }): Promise<boolean> => {
      console.log(`[auth] Attempting signup for: ${data.email}`);

      // Validate phone with the same regex used in the form
      const cleanPhone = data.phone.trim();
      if (!indianPhoneRegex.test(cleanPhone)) {
        toast.error("Enter a valid 10-digit Indian mobile number.");
        return false;
      }

      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email.trim().toLowerCase(),
        password: data.password,
        options: {
          data: {
            phone: cleanPhone,
            first_name: data.firstName
              ? DOMPurify.sanitize(data.firstName.trim())
              : null,
            last_name: data.lastName
              ? DOMPurify.sanitize(data.lastName.trim())
              : null,
          },
        },
      });

      if (error) {
        console.error("[auth] Signup failed:", error.message);
        if (error.message?.toLowerCase().includes("already registered")) {
          toast.error(
            "This email is already registered. Please log in instead."
          );
        } else {
          toast.error(error.message ?? "Failed to create account. Please try again.");
        }
        return false;
      }

      // If email confirmation is required, Supabase returns a user but no session.
      // Keep the modal OPEN so the user sees the "Check your email" screen inside it.
      if (authData.user && !authData.session) {
        console.log(
          `[auth] Signup successful — awaiting email confirmation: ${data.email}`
        );
        setPendingEmail(data.email.trim().toLowerCase());
        // Do NOT close the modal — the pending screen will show inside it
        return true;
      }

      // If email confirmation is disabled (instant login)
      if (authData.session) {
        console.log(`[auth] Signup + instant login for: ${data.email}`);
        const firstName = data.firstName
          ? DOMPurify.sanitize(data.firstName.trim())
          : null;
        toast.success(
          `Account created! Welcome${firstName ? `, ${firstName}` : ""}! 🎉`
        );
        setLoginModalOpen(false);
        if (onSuccessCallback) {
          setTimeout(() => {
            onSuccessCallback();
            setOnSuccessCallback(null);
          }, 150);
        }
        return true;
      }

      return false;
    },
    [onSuccessCallback]
  );

  // ── Logout ──────────────────────────────────────────────────────────────────

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setPendingEmail(null);
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

  const clearPendingEmail = useCallback(() => {
    setPendingEmail(null);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        session,
        isLoggedIn: !!user,
        isLoading,
        login,
        signup,
        logout,
        pendingEmail,
        clearPendingEmail,
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
