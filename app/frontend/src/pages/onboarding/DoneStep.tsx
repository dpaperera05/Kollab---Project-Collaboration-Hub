import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSession, setOnboardingCompleted } from "@/lib/authStore";
import { cn } from "@/lib/utils";

const DoneStep = () => {
  const navigate = useNavigate();
  const session = getSession();

  useEffect(() => {
    if (!session) {
      navigate("/login", { replace: true });
      return;
    }
    // Mark completed
    setOnboardingCompleted();
  }, [session, navigate]);

  if (!session) return null;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Ambient glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.06] blur-[140px]" />
      </div>

      <div
        className={cn(
          "relative z-10 w-full max-w-md rounded-2xl border border-border p-10 text-center",
          "bg-card/80 backdrop-blur-xl shadow-xl dark:border-[hsl(240_8%_24%)] dark:bg-card/90 dark:shadow-[0_8px_32px_hsl(0_0%_0%/0.4)]"
        )}
      >
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">You're all set!</h1>
        <p className="mt-3 text-muted-foreground">
          Your profile is ready. Start exploring projects on Kollab.
        </p>

        <Button
          onClick={() => navigate("/profile")}
          className="mt-8 h-12 w-full rounded-xl text-base font-semibold shadow-[0_4px_14px_hsl(270_80%_60%/0.25)] hover:shadow-[0_6px_20px_hsl(270_80%_60%/0.35)] hover:-translate-y-0.5 transition-all duration-200"
        >
          Go to Profile
        </Button>
      </div>
    </div>
  );
};

export default DoneStep;
