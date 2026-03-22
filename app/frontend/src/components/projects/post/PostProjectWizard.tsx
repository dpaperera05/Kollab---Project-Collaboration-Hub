import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import Step1Basics, {type BasicsData } from "./Step1Basics";
import Step2Roles, {type RoleData } from "./Step2Roles";
import Step3Settings, {type SettingsData } from "./Step3Settings";
import Step4Review from "./Step4Review";
import { cn } from "@/lib/utils";
import { Check, Layers, Users, Settings, Eye } from "lucide-react";
import { apiPost } from "@/lib/api";
import { getSession } from "@/lib/authStore";

const STEPS = [
  { label: "Project Basics", icon: Layers, desc: "Identity & details" },
  { label: "Add Roles", icon: Users, desc: "Team you need" },
  { label: "Settings", icon: Settings, desc: "Tags & terms" },
  { label: "Review & Publish", icon: Eye, desc: "Go live" },
];

export interface WizardData {
  basics: BasicsData | null;
  roles: RoleData[];
  settings: SettingsData | null;
}

const StepIndicator = ({ current }: { current: number }) => (
  <div className="flex items-center w-full max-w-2xl mx-auto">
    {STEPS.map((step, i) => {
      const stepNum = i + 1;
      const isDone = current > stepNum;
      const isActive = current === stepNum;
      const Icon = step.icon;
      return (
        <div key={step.label} className="flex-1 flex items-center">
          {/* Step node */}
          <div className="flex flex-col items-center gap-2.5 w-full">
            {/* Icon circle */}
            <div
              className={cn(
                "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-sm",
                isDone
                  ? "bg-primary text-primary-foreground shadow-brand"
                  : isActive
                  ? "bg-primary text-primary-foreground shadow-brand ring-8 ring-primary/15"
                  : "bg-muted/80 text-muted-foreground border border-border"
              )}
            >
              {isDone ? <Check size={22} strokeWidth={2.5} /> : <Icon size={22} />}
            </div>
            {/* Label + sub-desc */}
            <div className="text-center px-1">
              <span
                className={cn(
                  "text-xs font-bold block leading-tight",
                  isActive ? "text-primary" : isDone ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </span>
              <span className="text-[10px] text-muted-foreground hidden sm:block mt-0.5">
                {step.desc}
              </span>
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div
              className={cn(
                "w-8 sm:w-12 h-0.5 flex-shrink-0 mb-10 transition-all duration-500",
                isDone ? "bg-primary" : "bg-border"
              )}
            />
          )}
        </div>
      );
    })}
  </div>
);

const PostProjectWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({ basics: null, roles: [], settings: null });

  useEffect(() => {
    const session = getSession();
    if (!session) {
      navigate("/login", { replace: true });
      toast({ title: "Please login to post a project", variant: "destructive" });
    }
  }, [navigate]);

  const handleBasicsDone = (basics: BasicsData) => {
    setData((d) => ({ ...d, basics }));
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRolesDone = (roles: RoleData[]) => {
    setData((d) => ({ ...d, roles }));
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSettingsDone = (settings: SettingsData) => {
    setData((d) => ({ ...d, settings }));
    setStep(4);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const fileToBase64 = (file: File | null): Promise<string | undefined> => {
    if (!file) return Promise.resolve(undefined);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handlePublish = async () => {
    const { basics, roles, settings } = data;
    if (!basics || !settings) return;

    try {
      const posterImage = await fileToBase64(basics.posterFile);
      const payload = {
        title: basics.title,
        summary: basics.summary,
        problemStatement: basics.problemStatement,
        deliverables: basics.deliverables,
        projectType: basics.projectType,
        domain: basics.domain,
        technologies: basics.technologies,
        difficulty: basics.difficulty,
        duration: basics.duration,
        weeklyHours: basics.weeklyHours,
        compensation: basics.compensation,
        posterImage: posterImage || basics.posterPreviewUrl,
        tags: settings.tags,
        roles: roles.map((r) => ({
          id: r.id,
          title: r.title,
          responsibilities: r.responsibilities,
          requiredSkills: r.requiredSkills,
          niceToHaveSkills: r.niceToHaveSkills,
          level: r.level,
          seats: r.seats,
          status: r.status,
        })),
      };

      const res = await apiPost<{ success: boolean; data: { project: { _id: string } } }>("/projects", payload);
      const id = res?.data?.project?._id;
      toast({ title: "Project posted successfully 🎉" });
      if (id) {
        navigate(`/projects/${id}`);
      } else {
        navigate("/projects");
      }
    } catch (error: any) {
      console.error(error);
      toast({ title: error?.message || "Failed to post project", variant: "destructive" });
    }
  };

  const stepDescriptions = [
    "Tell us about your project — what it is, what it solves, and what you're building.",
    "Define the roles you need. Be specific — great role descriptions attract great collaborators.",
    "Add tags and confirm you're ready to share this project with the Kollab community.",
    "Everything looks good? Give it one final look before you go live.",
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, hsl(var(--primary) / 0.10) 0%, hsl(var(--accent-brand) / 0.05) 50%, transparent 100%)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-60px",
            left: "-80px",
            width: "340px",
            height: "340px",
            borderRadius: "50%",
            background: "radial-gradient(circle, hsl(var(--primary) / 0.08), transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute pointer-events-none"
          style={{
            top: "20px",
            right: "-60px",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            background: "radial-gradient(circle, hsl(var(--accent-brand) / 0.07), transparent 70%)",
            filter: "blur(50px)",
          }}
        />

        <div className="relative max-w-4xl mx-auto px-6 pt-14 pb-12 text-center">
          {/* Step badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-5">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Step {step} of {STEPS.length}
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-foreground tracking-tight mb-3">
            Post a <span className="gradient-text">Project</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg mx-auto mb-12 leading-relaxed">
            {stepDescriptions[step - 1]}
          </p>

          {/* Step indicator — centered */}
          <StepIndicator current={step} />
        </div>

        {/* Bottom fade into background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none"
          style={{
            background: "linear-gradient(to bottom, transparent, hsl(var(--background)))",
          }}
        />
      </div>

      {/* Step content — wider container */}
      <div className="max-w-4xl mx-auto w-full px-6 py-10">
        {step === 1 && (
          <Step1Basics
            initialData={data.basics}
            onNext={handleBasicsDone}
            onCancel={() => navigate("/projects")}
          />
        )}
        {step === 2 && (
          <Step2Roles
            initialRoles={data.roles}
            onNext={handleRolesDone}
            onBack={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}
        {step === 3 && (
          <Step3Settings
            initialData={data.settings}
            onNext={handleSettingsDone}
            onBack={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />
        )}
        {step === 4 && data.basics && data.settings && (
          <Step4Review
            basics={data.basics}
            roles={data.roles}
            settings={data.settings}
            onBack={() => { setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            onPublish={handlePublish}
          />
        )}
      </div>
    </div>
  );
};

export default PostProjectWizard;
