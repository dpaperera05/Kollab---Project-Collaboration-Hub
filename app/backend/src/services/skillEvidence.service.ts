export interface SkillEvidenceProjectSignals {
  technologies?: string[];
  requiredSkills?: string[];
  niceToHaveSkills?: string[];
}

export interface SkillEvidenceShowcaseSignals {
  techStack?: string[];
}

export interface ComputeSkillEvidenceInput {
  profileSkills?: string[];
  profileTechStack?: string[];
  projects?: SkillEvidenceProjectSignals[];
  showcases?: SkillEvidenceShowcaseSignals[];
}

const normalise = (value: string): string => value.trim().toLowerCase();

const addLabel = (labelByNorm: Map<string, string>, raw: unknown) => {
  if (typeof raw !== "string") return;
  const trimmed = raw.trim();
  if (!trimmed) return;
  const norm = normalise(trimmed);
  if (!labelByNorm.has(norm)) {
    labelByNorm.set(norm, trimmed);
  }
};

const addPoints = (pointsByNorm: Map<string, number>, norm: string, points: number) => {
  pointsByNorm.set(norm, (pointsByNorm.get(norm) || 0) + points);
};

const toScore = (points: number): number => {
  if (points <= 0) return 0;
  // Diminishing returns curve so strong evidence trends toward 100 without
  // forcing the top skill to become 100 through relative normalisation.
  const score = 15 + 85 * (1 - Math.exp(-points / 90));
  return Math.max(1, Math.min(100, Math.round(score)));
};

export const computeSkillEvidenceForMember = (
  input: ComputeSkillEvidenceInput,
): Record<string, number> => {
  const labelByNorm = new Map<string, string>();
  const pointsByNorm = new Map<string, number>();

  const profileSkills = (input.profileSkills || []).filter(
    (skill): skill is string => typeof skill === "string" && skill.trim().length > 0,
  );
  const profileTechStack = (input.profileTechStack || []).filter(
    (skill): skill is string => typeof skill === "string" && skill.trim().length > 0,
  );

  profileSkills.forEach((skill) => addLabel(labelByNorm, skill));
  profileTechStack.forEach((tech) => addLabel(labelByNorm, tech));

  // Profile self-declared signals provide a baseline confidence layer.
  profileSkills.forEach((skill) => addPoints(pointsByNorm, normalise(skill), 18));
  profileTechStack.forEach((tech) => addPoints(pointsByNorm, normalise(tech), 22));

  (input.projects || []).forEach((project) => {
    const projectTech = new Set<string>();
    const required = new Set<string>();
    const niceToHave = new Set<string>();

    (project.technologies || []).forEach((tech) => {
      if (typeof tech !== "string" || !tech.trim()) return;
      addLabel(labelByNorm, tech);
      projectTech.add(normalise(tech));
    });

    (project.requiredSkills || []).forEach((skill) => {
      if (typeof skill !== "string" || !skill.trim()) return;
      addLabel(labelByNorm, skill);
      required.add(normalise(skill));
    });

    (project.niceToHaveSkills || []).forEach((skill) => {
      if (typeof skill !== "string" || !skill.trim()) return;
      addLabel(labelByNorm, skill);
      niceToHave.add(normalise(skill));
    });

    projectTech.forEach((norm) => addPoints(pointsByNorm, norm, 16));
    required.forEach((norm) => addPoints(pointsByNorm, norm, 14));
    niceToHave.forEach((norm) => addPoints(pointsByNorm, norm, 8));
  });

  (input.showcases || []).forEach((showcase) => {
    const showcaseTech = new Set<string>();
    (showcase.techStack || []).forEach((tech) => {
      if (typeof tech !== "string" || !tech.trim()) return;
      addLabel(labelByNorm, tech);
      showcaseTech.add(normalise(tech));
    });
    showcaseTech.forEach((norm) => addPoints(pointsByNorm, norm, 24));
  });

  const scored: Array<[string, number]> = [];
  pointsByNorm.forEach((points, norm) => {
    const label = labelByNorm.get(norm) || norm;
    const score = toScore(points);
    if (score > 0) {
      scored.push([label, score]);
    }
  });

  scored.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

  const skillEvidenceScores: Record<string, number> = {};
  scored.forEach(([label, score]) => {
    skillEvidenceScores[label] = score;
  });

  return skillEvidenceScores;
};
