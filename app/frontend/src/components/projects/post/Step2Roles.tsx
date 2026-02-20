import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoleCard from "./RoleCard";

export interface RoleData {
  id: string;
  title: string;
  responsibilities: string;
  requiredSkills: string[];
  niceToHaveSkills: string[];
  level: string;
  seats: number;
  status: string;
}

const emptyRole = (): RoleData => ({
  id: `role-${Date.now()}-${Math.random()}`,
  title: "",
  responsibilities: "",
  requiredSkills: [],
  niceToHaveSkills: [],
  level: "Junior",
  seats: 1,
  status: "Open",
});

interface Props {
  initialRoles: RoleData[];
  onNext: (roles: RoleData[]) => void;
  onBack: () => void;
}

const Step2Roles = ({ initialRoles, onNext, onBack }: Props) => {
  const [roles, setRoles] = useState<RoleData[]>(
    initialRoles.length > 0 ? initialRoles : [emptyRole()]
  );
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof RoleData, string>>>>({});
  const [globalError, setGlobalError] = useState("");

  const updateRole = (id: string, updated: RoleData) =>
    setRoles((rs) => rs.map((r) => (r.id === id ? updated : r)));

  const deleteRole = (id: string) =>
    setRoles((rs) => rs.filter((r) => r.id !== id));

  const addRole = () => setRoles((rs) => [...rs, emptyRole()]);

  const validate = (): boolean => {
    if (roles.length === 0) {
      setGlobalError("Add at least one role before continuing.");
      return false;
    }
    setGlobalError("");
    const newErrors: Record<string, Partial<Record<keyof RoleData, string>>> = {};
    let valid = true;
    for (const role of roles) {
      const errs: Partial<Record<keyof RoleData, string>> = {};
      if (!role.title.trim()) errs.title = "Role title is required.";
      if (!role.responsibilities.trim()) errs.responsibilities = "Responsibilities are required.";
      if (role.requiredSkills.length === 0) errs.requiredSkills = "Select at least one skill.";
      if (!role.level) errs.level = "Select a level.";
      if (!role.seats || role.seats < 1) errs.seats = "Enter seats ≥ 1.";
      if (Object.keys(errs).length > 0) {
        newErrors[role.id] = errs;
        valid = false;
      }
    }
    setErrors(newErrors);
    return valid;
  };

  const handleNext = () => {
    if (validate()) onNext(roles);
  };

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Info banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary-soft p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-primary" />
        </div>
        <div>
          <p className="font-bold text-foreground text-sm">Who are you looking for?</p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Define one or more roles for your project. Be specific — great descriptions attract great collaborators.
            You must add at least one role.
          </p>
        </div>
      </div>

      {globalError && (
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive font-medium">
          ⚠ {globalError}
        </div>
      )}

      <div className="space-y-5">
        {roles.map((role, i) => (
          <RoleCard
            key={role.id}
            role={role}
            index={i}
            errors={errors[role.id] ?? {}}
            onChange={(updated) => updateRole(role.id, updated)}
            onDelete={() => deleteRole(role.id)}
            canDelete={roles.length > 1}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={addRole}
        className="flex items-center gap-2.5 px-5 py-3.5 rounded-2xl border-2 border-dashed border-border text-sm font-semibold text-muted-foreground hover:border-primary/50 hover:text-primary hover:bg-primary-soft transition-all duration-200 w-full justify-center group"
      >
        <div className="w-6 h-6 rounded-full bg-muted group-hover:bg-primary/15 flex items-center justify-center transition-colors">
          <Plus size={14} />
        </div>
        Add Another Role
      </button>

      <div className="flex justify-between pt-2 pb-10">
        <Button variant="outline" onClick={onBack} className="px-6">← Back</Button>
        <Button
          onClick={handleNext}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-brand px-8 font-bold"
        >
          Next: Settings →
        </Button>
      </div>
    </div>
  );
};

export default Step2Roles;
