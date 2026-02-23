import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/layout/Navbar";
import { requestPasswordReset } from "@/lib/authStore";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    requestPasswordReset(email.trim());
    setLoading(false);

    toast({
      title: "Check your email",
      description: "If an account exists for this email, a reset code has been sent.",
    });

    navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
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
              Forgot your password?
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your email and we'll send a reset code.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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

            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl text-base font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.25)] hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.35)] hover:-translate-y-0.5 transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Sending…
                </span>
              ) : (
                "Send reset code"
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

export default ForgotPasswordPage;
