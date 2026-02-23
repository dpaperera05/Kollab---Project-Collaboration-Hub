import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import OtpInput from "@/components/auth/OtpInput";
import { resetPassword } from "@/lib/authStore";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get("email") || "";

  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = (): string | null => {
    if (!email.trim()) return "Email is required.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
      return "Please enter a valid email address.";
    if (code.length < 6) return "Please enter the 6-digit reset code.";
    if (!password) return "New password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));

    const result = resetPassword(email.trim(), password, code);
    setLoading(false);

    if (!result.success) {
      setError((result as { success: false; error: string }).error);
      return;
    }

    toast({
      title: "Password updated",
      description: "Your password has been reset successfully.",
    });
    navigate("/login");
  };

  return (
    <>
      <Navbar />
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-24 pb-12">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.07] blur-[120px]" />
          <div className="absolute right-1/4 top-1/4 w-[300px] h-[300px] rounded-full bg-[hsl(315_85%_65%/0.05)] blur-[100px]" />
        </div>

        <div
          className={cn(
            "relative z-10 w-full max-w-md rounded-2xl border border-border p-8 sm:p-10",
            "bg-card/80 backdrop-blur-xl shadow-xl dark:border-[hsl(240_8%_24%)] dark:bg-card/90 dark:shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]",
            "transition-all duration-300"
          )}
        >
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Reset password
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {emailFromQuery ? (
                <>Set a new password for <span className="font-medium text-foreground">{emailFromQuery}</span></>
              ) : (
                "Enter your email and set a new password."
              )}
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email field — shown only if no email in query */}
            {!emailFromQuery && (
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
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 rounded-xl bg-background/60 text-base placeholder:text-muted-foreground/60 focus-visible:ring-primary"
                />
              </div>
            )}

            {/* Reset code */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Reset code
              </Label>
              <OtpInput value={code} onChange={(v) => { setCode(v); setError(""); }} />
            </div>

            {/* New password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword" className="text-sm font-medium text-foreground">
                New password
              </Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirm new password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
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
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.25)] hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Updating…
                </span>
              ) : (
                "Update password"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Link
              to="/login"
              className="font-semibold text-primary hover:text-primary/80 transition-colors"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default ResetPasswordPage;
