import { useState, useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Gem, Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/lib/auth";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const indianPhoneRegex = /^[6-9]\d{9}$/;

const sanitizeIdentifier = (val: string) => {
  if (val.includes("@")) return val.trim();
  let cleaned = val.replace(/[\s\-\(\)]/g, "");
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.length === 12 && cleaned.startsWith("91")) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email address is required")
    .regex(emailRegex, "Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().min(1, "Email is required").regex(emailRegex, "Enter a valid email address"),
    phone: z
      .string()
      .min(1, "Phone number is required")
      .transform(sanitizeIdentifier)
      .refine((val) => indianPhoneRegex.test(val), "Enter a valid 10-digit Indian mobile number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

// ─── Shared Input Classes ─────────────────────────────────────────────────────

const inputClasses =
  "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors";

// ─── Email Confirmation Screen ────────────────────────────────────────────────

function EmailConfirmationScreen({
  email,
  onDone,
  onBack,
}: {
  email: string;
  onDone: () => void;
  onBack: () => void;
}) {
  const COOLDOWN = 60;
  const [countdown, setCountdown] = useState(0);
  const [isSending, setIsSending] = useState(false);

  // Start a 60s cooldown immediately so user can't spam resend on load
  useEffect(() => {
    setCountdown(COOLDOWN);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleResend = async () => {
    setIsSending(true);
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
    });
    setIsSending(false);
    if (error) {
      toast.error("Could not resend email. Please try again.");
    } else {
      toast.success("Confirmation email resent! Check your inbox.");
      // Reset cooldown
      setCountdown(COOLDOWN);
      const interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(interval); return 0; }
          return c - 1;
        });
      }, 1000);
    }
  };

  return (
    <div className="px-6 pb-8">
      {/* Animated mail envelope */}
      <div className="flex flex-col items-center text-center py-6">
        <div className="relative mb-5">
          {/* Outer pulsing ring */}
          <div className="absolute inset-0 rounded-full bg-blue-100 animate-ping opacity-40" />
          <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 flex items-center justify-center shadow-md">
            <Mail className="h-9 w-9 text-blue-500" />
          </div>
        </div>

        <h3 className="text-xl font-bold tracking-tight mb-1">Check your inbox</h3>
        <p className="text-sm text-muted-foreground mb-1">
          We sent a confirmation link to
        </p>
        <p className="text-sm font-semibold text-foreground bg-muted/60 px-3 py-1 rounded-full mb-4 break-all">
          {email}
        </p>

        {/* Steps */}
        <ol className="text-left w-full space-y-2 mb-5">
          {[
            "Open the email from Cambay Crystal",
            "Click \"Confirm your email\"",
            "You'll be signed in automatically",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="flex-shrink-0 h-5 w-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center mt-px">
                {i + 1}
              </span>
              <span className="text-muted-foreground">{step}</span>
            </li>
          ))}
        </ol>

        {/* Done button */}
        <button
          onClick={onDone}
          className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 mb-3"
        >
          Got it, I'll check my email
        </button>

        {/* Resend */}
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isSending}
          className="w-full h-10 rounded-xl border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors mb-2"
        >
          {isSending
            ? "Sending…"
            : countdown > 0
              ? `Resend email in ${countdown}s`
              : "Resend confirmation email"}
        </button>

        {/* Back link */}
        <button
          type="button"
          onClick={onBack}
          className="text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Wrong email? Go back to sign up
        </button>
      </div>
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export function LoginModal() {
  const { loginModalOpen, hideLoginModal, login, signup, pendingEmail, clearPendingEmail } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // ── Login Form ────────────────────────────────────────────────────────────

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  // ── Signup Form ───────────────────────────────────────────────────────────

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
    },
  });

  // ── Reset everything ──────────────────────────────────────────────────────

  const resetAll = useCallback(() => {
    loginForm.reset();
    signupForm.reset();
    setShowLoginPassword(false);
    setShowSignupPassword(false);
    setShowConfirmPassword(false);
    setIsSendingReset(false);
  }, [loginForm, signupForm]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleLogin = loginForm.handleSubmit(async (values) => {
    await login(values.identifier, values.password);
  });

  const handleSignup = signupForm.handleSubmit(async (values) => {
    await signup({
      email: values.email,
      phone: values.phone,
      password: values.password,
      firstName: values.firstName || undefined,
      lastName: values.lastName || undefined,
    });
  });

  const handleForgotPassword = async () => {
    const email = loginForm.getValues("identifier").trim().toLowerCase();
    if (!email || !emailRegex.test(email)) {
      toast.error("Enter your email address above, then click Forgot password.");
      return;
    }
    setIsSendingReset(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSendingReset(false);
    if (error) {
      toast.error("Could not send reset email. Please try again.");
    } else {
      toast.success(`Password reset email sent to ${email}. Check your inbox.`);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as "login" | "signup");
    resetAll();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      hideLoginModal();
      // Reset after close animation
      setTimeout(() => {
        resetAll();
        setActiveTab("login");
      }, 200);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Dialog open={loginModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[440px] rounded-2xl p-0 gap-0 overflow-hidden border-border/50 shadow-2xl">
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className={`px-6 pt-8 pb-6 ${pendingEmail ? "bg-blue-50/60" : "bg-primary/[0.04]"}`}>
          <DialogHeader className="items-center text-center">
            <div className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-all ${
              pendingEmail
                ? "bg-blue-100 ring-blue-200"
                : "bg-primary/10 ring-primary/20"
            }`}>
              {pendingEmail
                ? <Mail className="h-7 w-7 text-blue-500" />
                : <Gem className="h-7 w-7 text-primary" />}
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-center">
              {pendingEmail ? "Verify your email" : "Welcome to Cambay Crystal"}
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              {pendingEmail
                ? "One last step — confirm your email to activate your account"
                : activeTab === "login"
                  ? "Sign in to your account to continue shopping"
                  : "Create an account to start your gemstone journey"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Email Confirmation Pending Screen ───────────────────────────── */}
        {pendingEmail ? (
          <EmailConfirmationScreen
            email={pendingEmail}
            onDone={hideLoginModal}
            onBack={() => {
              clearPendingEmail();
              handleTabChange("signup");
            }}
          />
        ) : (
          <div className="px-6 pt-4 pb-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 h-11 rounded-xl bg-muted/70 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Log In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md transition-all"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ── Login Tab ──────────────────────────────────────────────── */}
            <TabsContent value="login" className="mt-5">
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Identifier */}
                <div className="space-y-1.5">
                  <label htmlFor="login-identifier" className="text-sm font-medium text-foreground">
                    Email Address
                  </label>
                  <input
                    id="login-identifier"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClasses}
                    {...loginForm.register("identifier")}
                  />
                  {loginForm.formState.errors.identifier && (
                    <p className="text-xs text-destructive mt-1">
                      {loginForm.formState.errors.identifier.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="login-password" className="text-sm font-medium text-foreground">
                      Password
                    </label>
                    <button
                      type="button"
                      disabled={isSendingReset}
                      onClick={handleForgotPassword}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer disabled:opacity-50"
                    >
                      {isSendingReset ? "Sending…" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      id="login-password"
                      type={showLoginPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      className={`${inputClasses} pr-10`}
                      {...loginForm.register("password")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowLoginPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showLoginPassword ? "Hide password" : "Show password"}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {loginForm.formState.errors.password && (
                    <p className="text-xs text-destructive mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* No extra reset alert needed — handled via toast */}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loginForm.formState.isSubmitting}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
                >
                  {loginForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Signing in…
                    </>
                  ) : (
                    "Log In"
                  )}
                </button>

                {/* Switch prompt */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("signup")}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </form>
            </TabsContent>

            {/* ── Sign Up Tab ────────────────────────────────────────────── */}
            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignup} className="space-y-3.5">
                {/* Name row */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="signup-first-name" className="text-sm font-medium text-foreground">
                      First Name
                    </label>
                    <input
                      id="signup-first-name"
                      type="text"
                      placeholder="John"
                      autoComplete="given-name"
                      className={inputClasses}
                      {...signupForm.register("firstName")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="signup-last-name" className="text-sm font-medium text-foreground">
                      Last Name
                    </label>
                    <input
                      id="signup-last-name"
                      type="text"
                      placeholder="Doe"
                      autoComplete="family-name"
                      className={inputClasses}
                      {...signupForm.register("lastName")}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <label htmlFor="signup-email" className="text-sm font-medium text-foreground">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    className={inputClasses}
                    {...signupForm.register("email")}
                  />
                  {signupForm.formState.errors.email && (
                    <p className="text-xs text-destructive mt-1">
                      {signupForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label htmlFor="signup-phone" className="text-sm font-medium text-foreground">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground select-none">
                      +91
                    </span>
                    <input
                      id="signup-phone"
                      type="tel"
                      placeholder="9876543210"
                      autoComplete="tel-national"
                      maxLength={10}
                      className={`${inputClasses} pl-11`}
                      {...signupForm.register("phone")}
                    />
                  </div>
                  {signupForm.formState.errors.phone && (
                    <p className="text-xs text-destructive mt-1">
                      {signupForm.formState.errors.phone.message}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="signup-password" className="text-sm font-medium text-foreground">
                    Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showSignupPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputClasses} pr-10`}
                      {...signupForm.register("password")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowSignupPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showSignupPassword ? "Hide password" : "Show password"}
                    >
                      {showSignupPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signupForm.formState.errors.password && (
                    <p className="text-xs text-destructive mt-1">
                      {signupForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="signup-confirm-password" className="text-sm font-medium text-foreground">
                    Confirm Password <span className="text-destructive">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="signup-confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`${inputClasses} pr-10`}
                      {...signupForm.register("confirmPassword")}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {signupForm.formState.errors.confirmPassword && (
                    <p className="text-xs text-destructive mt-1">
                      {signupForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={signupForm.formState.isSubmitting}
                  className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20 mt-1"
                >
                  {signupForm.formState.isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account…
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Switch prompt */}
                <div className="relative my-1">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground">or</span>
                  </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => handleTabChange("login")}
                    className="font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer"
                  >
                    Log in
                  </button>
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
