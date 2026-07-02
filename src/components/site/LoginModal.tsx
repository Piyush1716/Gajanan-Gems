import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Gem, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
    .min(1, "Email or phone number is required")
    .transform(sanitizeIdentifier)
    .refine(
      (val) => emailRegex.test(val) || indianPhoneRegex.test(val),
      {
        message: "Enter a valid email address or 10-digit Indian mobile number",
      }
    ),
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

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginModal() {
  const { loginModalOpen, hideLoginModal, login, signup } = useAuth();

  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showResetMsg, setShowResetMsg] = useState(false);

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
    setShowResetMsg(false);
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
        <div className="bg-primary/[0.04] px-6 pt-8 pb-6">
          <DialogHeader className="items-center text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
              <Gem className="h-7 w-7 text-primary" />
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight text-center">
              Welcome to GajananGems
            </DialogTitle>
            <DialogDescription className="text-muted-foreground text-center">
              {activeTab === "login"
                ? "Sign in to your account to continue shopping"
                : "Create an account to start your gemstone journey"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
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
                    Email Address or Phone Number
                  </label>
                  <input
                    id="login-identifier"
                    type="text"
                    placeholder="you@example.com or 9876543210"
                    autoComplete="username"
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
                      onClick={() => {
                        setShowResetMsg(true);
                        toast.error("Password reset is currently unavailable. Please contact support.");
                      }}
                      className="text-xs text-primary hover:underline font-medium cursor-pointer"
                    >
                      Forgot password?
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

                {/* Password Reset Unavailable Alert */}
                {showResetMsg && (
                  <Alert variant="destructive" className="bg-destructive/5 text-destructive border-destructive/10">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs font-medium">
                      Password reset is currently unavailable. Please contact support.
                    </AlertDescription>
                  </Alert>
                )}

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
      </DialogContent>
    </Dialog>
  );
}
