import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import OtpInput from "@/components/auth/OtpInput";
import { getSession, verifyEmail } from "@/lib/authStore";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const RESEND_SECONDS = 30;

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const session = getSession();

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_SECONDS);

  // Redirect if already verified
  useEffect(() => {
    if (session?.isEmailVerified) {
      if (!(session as any).onboardingCompleted) {
        navigate((session as any).onboardingStep || "/onboarding/role", { replace: true });
      } else {
        navigate("/profile", { replace: true });
      }
    }
  }, [session, navigate]);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const id = setInterval(() => setResendTimer((t) => t - 1), 1000);
    return () => clearInterval(id);
  }, [resendTimer]);

  const handleResend = () => {
    setResendTimer(RESEND_SECONDS);
    toast({ title: "Code resent", description: "A new verification code has been sent to your email." });
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      setError("");

      if (code.length < 6) return;

      setLoading(true);
      await new Promise((r) => setTimeout(r, 500));

      const result = await verifyEmail(code);
      setLoading(false);

      if (!result.success) {
        setError((result as { success: false; error: string }).error);
        return;
      }

      toast({ title: "Email verified!", description: "Your account is now verified." });
      navigate("/onboarding/role");
    },
    [code, navigate]
  );

  // No session state
  if (!session) {
    return (
      <>
        <Navbar />
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 pt-24 pb-12">
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.07] blur-[120px]" />
          </div>
          <div
            className={cn(
              "relative z-10 w-full max-w-md rounded-2xl border border-border p-8 sm:p-10 text-center",
              "bg-card/80 backdrop-blur-xl shadow-xl dark:border-[hsl(240_8%_24%)] dark:bg-card/90 dark:shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]"
            )}
          >
            <h1 className="text-2xl font-bold tracking-tight text-foreground">No active session</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to verify your email.</p>
            <Button asChild className="mt-6 h-12 w-full rounded-xl text-base font-semibold">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

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
              Verify your email
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{session.email}</span>
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <OtpInput value={code} onChange={(v) => { setCode(v); setError(""); }} />

            <Button
              type="submit"
              disabled={loading || code.length < 6}
              className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.25)] hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Verifying…
                </span>
              ) : (
                "Verify"
              )}
            </Button>
          </form>

          {/* Secondary actions */}
          <div className="mt-6 flex flex-col items-center gap-3 text-sm">
            <div className="text-muted-foreground">
              {resendTimer > 0 ? (
                <span>Resend available in {resendTimer}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  Resend code
                </button>
              )}
            </div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <Link to="/register" className="font-medium hover:text-foreground transition-colors">
                Change email
              </Link>
              <span className="text-border">•</span>
              <Link to="/login" className="font-medium hover:text-foreground transition-colors">
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default VerifyEmailPage;
