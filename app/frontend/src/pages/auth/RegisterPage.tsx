import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import { register } from "@/lib/authStore";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const RegisterPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"member" | "mentor" | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    confirmPassword?: string;
    userType?: string;
    form?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateAll = () => {
    const emailError = !email.trim()
      ? "Email is required."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
        ? "Please enter a valid email address."
        : email.trim().length > 255
          ? "Email must be less than 255 characters."
          : undefined;

    const passwordError = !password
      ? "Password is required."
      : password.length < 8
        ? "Password must be at least 8 characters."
        : undefined;

    const confirmError = confirmPassword !== password ? "Passwords do not match." : undefined;

    const typeError = !userType ? "Please select a user type." : undefined;

    const nextErrors = {
      email: emailError,
      password: passwordError,
      confirmPassword: confirmError,
      userType: typeError,
    };

    setErrors((prev) => ({ ...prev, ...nextErrors, form: undefined }));
    return nextErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateAll();
    if (Object.values(validationErrors).some(Boolean)) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));

    const result = await register(email.trim(), password, userType!);
    setLoading(false);

    if (!result.success) {
      setErrors({ form: (result as { success: false; error: string }).error });
      return;
    }

    toast({
      title: "Account created!",
      description: "Welcome to Kollab. Let's verify your email.",
    });

    navigate("/verify-email");
  };

  return (
    <>
      <Navbar />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-24 pb-12">
        {/* Ambient background glow */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.07] blur-[120px]" />
          <div className="absolute right-1/4 top-1/4 w-[300px] h-[300px] rounded-full bg-[hsl(315_85%_65%/0.05)] blur-[100px]" />
        </div>

        {/* Card */}
        <div
          className={cn(
            "relative z-10 w-full max-w-md rounded-2xl border border-border p-8 sm:p-10",
            "bg-card/80 backdrop-blur-xl shadow-xl dark:border-[hsl(240_8%_24%)] dark:bg-card/90 dark:shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]",
            "transition-all duration-300"
          )}
        >
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Create your Kollab account
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Join projects, collaborate with teams, and build proof of skills.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  const value = e.target.value;
                  setEmail(value);
                  const nextError = !value.trim()
                    ? "Email is required."
                    : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                      ? "Please enter a valid email address."
                      : value.trim().length > 255
                        ? "Email must be less than 255 characters."
                        : undefined;
                  setErrors((prev) => ({ ...prev, email: nextError, form: undefined }));
                }}
                className="h-12 rounded-xl bg-background/60 text-base placeholder:text-muted-foreground/60 focus-visible:ring-primary"
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => {
                    const value = e.target.value;
                    setPassword(value);
                    const pwdError = !value
                      ? "Password is required."
                      : value.length < 8
                        ? "Password must be at least 8 characters."
                        : undefined;
                    const confirmError = confirmPassword && confirmPassword !== value ? "Passwords do not match." : undefined;
                    setErrors((prev) => ({ ...prev, password: pwdError, confirmPassword: confirmError, form: undefined }));
                  }}
                  className="h-12 rounded-xl bg-background/60 pr-11 text-base placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => {
                    const value = e.target.value;
                    setConfirmPassword(value);
                    const confirmError = value && value !== password ? "Passwords do not match." : undefined;
                    setErrors((prev) => ({ ...prev, confirmPassword: confirmError, form: undefined }));
                  }}
                  className="h-12 rounded-xl bg-background/60 pr-11 text-base placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showConfirm ? "Hide password" : "Show password"}
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword}</p>}
            </div>

            {/* User Type Selector */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                I want to join as
              </Label>
              <div className="grid grid-cols-2 gap-3">
                {(["member", "mentor"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setUserType(type);
                      setErrors((prev) => ({ ...prev, userType: undefined, form: undefined }));
                    }}
                    className={cn(
                      "relative flex flex-col items-center gap-1.5 rounded-xl border-2 px-4 py-4 text-sm font-semibold transition-all duration-200",
                      userType === type
                        ? "border-primary bg-primary/10 text-primary shadow-[0_0_12px_hsl(270_80%_60%/0.15)]"
                        : "border-border bg-background/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                    )}
                  >
                    <span className="text-lg">
                      {type === "member" ? "👤" : "🎓"}
                    </span>
                    <span className="capitalize">{type}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {type === "member"
                        ? "Join & collaborate on projects"
                        : "Guide teams & share expertise"}
                    </span>
                  </button>
                ))}
              </div>
              {errors.userType && <p className="text-xs text-destructive">{errors.userType}</p>}
            </div>

            {errors.form && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {errors.form}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.25)] hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Creating account…
                </span>
              ) : (
                "Create account"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
