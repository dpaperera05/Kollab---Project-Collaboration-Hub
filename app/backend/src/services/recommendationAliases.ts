/**
 * recommendationAliases.ts
 *
 * Canonical skill/technology alias system for the rule-based recommendation engine.
 *
 * Three match tiers with different weights:
 *   EXACT   – user term === project term (after normalisation)  → weight 1.0
 *   ALIAS   – user term and project term share a canonical group → weight 0.7
 *   RELATED – user term maps to a broader/related concept        → weight 0.4
 *
 * The weighting is applied in the scoring formula so that related matches
 * improve ranking without dominating projects that have concrete exact matches.
 *
 * No imports — this module is pure logic with no side effects.
 */

// ── Match tier ────────────────────────────────────────────────────────────────

export type MatchTier = "exact" | "alias" | "related";

export interface TermMatch {
  /** The user term that triggered the match (normalised, lowercase). */
  userTerm: string;
  /** The project term that was matched (normalised, lowercase). */
  projectTerm: string;
  tier: MatchTier;
  /** 1.0 | 0.7 | 0.4 */
  weight: number;
}

export const TIER_WEIGHTS: Record<MatchTier, number> = {
  exact: 1.0,
  alias: 0.7,
  related: 0.4,
};

// ── Normalisation ─────────────────────────────────────────────────────────────

/**
 * Normalisation table: maps raw user/project text → canonical lowercase form.
 *
 * Applied before any matching so that variant spellings collapse to one term.
 * Keys are lowercase; values are the canonical form (also lowercase).
 */
const NORMALISE_MAP: Record<string, string> = {
  // JavaScript ecosystem
  "react.js": "react",
  "reactjs": "react",
  "node.js": "node.js",          // keep canonical dot notation
  "node": "node.js",
  "nodejs": "node.js",
  "next.js": "next.js",
  "nextjs": "next.js",
  "nuxt.js": "nuxt.js",
  "nuxtjs": "nuxt.js",
  "vue.js": "vue.js",
  "vuejs": "vue.js",
  "express.js": "express",
  "expressjs": "express",
  "three.js": "three.js",
  "threejs": "three.js",
  "angular.js": "angular",
  "angularjs": "angular",

  // Python
  "pytorch": "pytorch",
  "torch": "pytorch",
  "tensorflow": "tensorflow",
  "tf": "tensorflow",
  "scikit-learn": "scikit-learn",
  "sklearn": "scikit-learn",
  "huggingface": "huggingface transformers",
  "huggingface transformers": "huggingface transformers",
  "transformers": "huggingface transformers",
  "langchain": "langchain",
  "fastapi": "fastapi",

  // ML / AI terminology
  "ml": "machine learning",
  "machine learning": "machine learning",
  "ai": "ai",
  "artificial intelligence": "ai",
  "ai & ml": "ai/ml",
  "ai/ml": "ai/ml",
  "ai / ml": "ai/ml",
  "ai & machine learning": "ai/ml",
  "ai / machine learning": "ai/ml",
  "deep learning": "deep learning",
  "nlp": "nlp",
  "natural language processing": "nlp",
  "computer vision": "computer vision",
  "cv": "computer vision",
  "llm": "llm",
  "large language models": "llm",

  // DevOps / Cloud
  "devops": "devops",
  "dev ops": "devops",
  "ci/cd": "ci/cd",
  "ci cd": "ci/cd",
  "cicd": "ci/cd",
  "kubernetes": "kubernetes",
  "k8s": "kubernetes",
  "docker": "docker",
  "terraform": "terraform",
  "ansible": "ansible",
  "github actions": "github actions",
  "gitlab ci": "gitlab ci",
  "aws": "aws",
  "gcp": "gcp",
  "google cloud": "gcp",
  "azure": "azure",
  "microsoft azure": "azure",

  // Databases
  "postgresql": "postgresql",
  "postgres": "postgresql",
  "mongodb": "mongodb",
  "mongo": "mongodb",
  "mysql": "mysql",
  "sqlite": "sqlite",
  "redis": "redis",
  "influxdb": "influxdb",
  "firestore": "firestore",
  "firebase": "firebase",

  // Mobile
  "flutter": "flutter",
  "react native": "react native",
  "swiftui": "swiftui",
  "swift": "swift",
  "kotlin": "kotlin",
  "android": "android",
  "ios": "ios",
  "iphone os": "ios",

  // Design
  "figma": "figma",
  "ui/ux": "ui/ux",
  "ui ux": "ui/ux",
  "ux": "ui/ux",
  "ux design": "ui/ux",
  "ui design": "ui/ux",
  "user experience": "ui/ux",
  "user interface": "ui/ux",

  // Games / 3D
  "unity": "unity",
  "unreal engine": "unreal engine",
  "unreal": "unreal engine",
  "godot": "godot",

  // General roles / domain terms
  "frontend": "frontend development",
  "front-end": "frontend development",
  "front end": "frontend development",
  "frontend development": "frontend development",
  "frontend developer": "frontend development",
  "backend": "backend development",
  "back-end": "backend development",
  "back end": "backend development",
  "backend development": "backend development",
  "backend developer": "backend development",
  "fullstack": "fullstack development",
  "full stack": "fullstack development",
  "full-stack": "fullstack development",
  "fullstack development": "fullstack development",
  "fullstack developer": "fullstack development",
  "web development": "web development",
  "web dev": "web development",
  "mobile development": "mobile development",
  "mobile dev": "mobile development",
  "data science": "data science",
  "data scientist": "data science",
  "data engineering": "data engineering",
  "data engineer": "data engineering",
  "software engineering": "software engineering",
  "software engineer": "software engineering",
  "software developer": "software engineering",
  "cloud engineering": "cloud engineering",
  "cloud engineer": "cloud engineering",
  "security engineering": "security engineering",
  "security engineer": "security engineering",
  "cybersecurity": "cybersecurity",
  "game development": "game development",
  "game developer": "game development",
  "api design": "api design",
  "api development": "api design",
  "rest api": "api design",
  "database design": "database design",
  "database administration": "database design",
  "dba": "database design",
  "cross-platform development": "cross-platform development",
  "cross platform development": "cross-platform development",
};

/**
 * Normalise a raw term:
 * 1. lowercase + trim
 * 2. collapse punctuation variants (e.g. "AI & ML" → "ai & ml" → "ai/ml")
 * 3. apply the NORMALISE_MAP lookup
 */
export function normalizeRecommendationTerm(raw: string): string {
  const step1 = raw.toLowerCase().trim();
  // collapse common separator variants before map lookup
  const step2 = step1
    .replace(/\s*&\s*/g, "/")    // "AI & ML" → "AI/ML" in lowercase already
    .replace(/\s+\/\s+/g, "/")  // "AI / ML" → "AI/ML"
    .replace(/\s+-\s+/g, "-");  // "scikit - learn" → "scikit-learn"
  return NORMALISE_MAP[step2] ?? NORMALISE_MAP[step1] ?? step2;
}

// ── Alias groups ──────────────────────────────────────────────────────────────

/**
 * Alias groups — every term in a group is a direct spelling/branding alias.
 * After normalisation these should all already resolve to the same canonical
 * form, but this layer handles any residual variants the normaliser missed.
 */
const ALIAS_GROUPS: readonly string[][] = [
  ["react", "react.js"],
  ["node.js", "express"],          // Express apps imply Node.js context
  ["next.js", "react"],            // Next.js is built on React
  ["nuxt.js", "vue.js"],
  ["machine learning", "deep learning"],
  ["ai/ml", "machine learning"],
  ["ai/ml", "ai"],
  ["pytorch", "tensorflow"],       // both are ML frameworks
  ["postgresql", "mysql", "sqlite"], // SQL databases
  ["docker", "kubernetes"],        // container ecosystem
  ["ios", "swift", "swiftui"],
  ["android", "kotlin"],
  ["flutter", "dart"],
  ["github actions", "ci/cd"],
  ["gitlab ci", "ci/cd"],
  ["devops", "ci/cd"],
];

/** Build O(1) alias lookup: canonical-normalised term → Set of all aliases. */
const ALIAS_MAP = new Map<string, Set<string>>();
for (const group of ALIAS_GROUPS) {
  const normalised = group.map((t) => normalizeRecommendationTerm(t));
  const groupSet = new Set(normalised);
  for (const term of groupSet) {
    const existing = ALIAS_MAP.get(term);
    if (existing) {
      for (const t of groupSet) existing.add(t);
    } else {
      ALIAS_MAP.set(term, new Set(groupSet));
    }
  }
}

// ── Related-term graph ────────────────────────────────────────────────────────

/**
 * Related-term graph — one-directional "A relates to B" edges used for
 * the broadest (0.4 weight) matching tier.
 *
 * Keys and values are post-normalisation terms.
 * "user has skill A" → "project uses B" counts as a related match.
 */
const RELATED_MAP: Record<string, string[]> = {
  // JS/TS ecosystem → broader categories
  "react":                 ["frontend development", "web development", "javascript"],
  "next.js":               ["frontend development", "web development", "react", "javascript"],
  "vue.js":                ["frontend development", "web development", "javascript"],
  "angular":               ["frontend development", "web development", "javascript"],
  "three.js":              ["frontend development", "web development", "3d graphics", "game development"],
  "express":               ["backend development", "api design", "node.js"],
  "node.js":               ["backend development", "javascript", "api design"],
  "fastapi":               ["backend development", "api design", "python"],
  "django":                ["backend development", "python", "web development"],
  "flask":                 ["backend development", "python", "api design"],

  // Python ML libraries → ML categories
  "pytorch":               ["machine learning", "deep learning", "ai/ml", "python"],
  "tensorflow":            ["machine learning", "deep learning", "ai/ml", "python"],
  "scikit-learn":          ["machine learning", "data science", "python"],
  "huggingface transformers": ["machine learning", "nlp", "ai/ml", "python"],
  "langchain":             ["llm", "nlp", "ai/ml", "python"],
  "opencv":                ["computer vision", "ai/ml", "python"],
  "mediapipe":             ["computer vision", "ai/ml", "python"],

  // Databases → categories
  "mongodb":               ["database design", "nosql", "backend development"],
  "postgresql":            ["database design", "sql", "backend development"],
  "mysql":                 ["database design", "sql", "backend development"],
  "redis":                 ["backend development", "caching", "database design"],
  "influxdb":              ["database design", "iot", "time-series"],
  "firebase":              ["backend development", "mobile development"],

  // DevOps / Cloud → categories
  "docker":                ["devops", "ci/cd", "cloud engineering", "kubernetes"],
  "kubernetes":            ["devops", "ci/cd", "cloud engineering", "docker"],
  "terraform":             ["devops", "cloud engineering", "infrastructure as code"],
  "aws":                   ["cloud engineering", "devops"],
  "azure":                 ["cloud engineering", "devops"],
  "gcp":                   ["cloud engineering", "devops"],
  "github actions":        ["devops", "ci/cd"],
  "gitlab ci":             ["devops", "ci/cd"],
  "ci/cd":                 ["devops", "software engineering"],

  // Mobile → categories
  "flutter":               ["mobile development", "cross-platform development", "dart"],
  "react native":          ["mobile development", "cross-platform development", "react"],
  "swift":                 ["ios", "mobile development"],
  "swiftui":               ["ios", "mobile development", "swift"],
  "kotlin":                ["android", "mobile development"],

  // Design tools → categories
  "figma":                 ["ui/ux", "design systems", "product design"],

  // Game engines → categories
  "unity":                 ["game development", "c#", "3d graphics"],
  "unreal engine":         ["game development", "c++", "3d graphics"],

  // Broad ML/AI terms → specific
  "machine learning":      ["ai/ml", "data science", "python"],
  "deep learning":         ["machine learning", "ai/ml", "python"],
  "nlp":                   ["machine learning", "ai/ml", "data science"],
  "computer vision":       ["machine learning", "ai/ml", "python"],
  "ai/ml":                 ["machine learning", "data science"],
  "llm":                   ["nlp", "machine learning", "ai/ml"],

  // Broad role/category → specific
  "frontend development":  ["web development", "javascript", "react", "ui/ux"],
  "backend development":   ["api design", "database design", "software engineering"],
  "fullstack development": ["frontend development", "backend development", "web development"],
  "data science":          ["machine learning", "python", "data engineering"],
  "data engineering":      ["data science", "python", "database design"],
  "devops":                ["ci/cd", "cloud engineering", "docker", "kubernetes"],
  "cloud engineering":     ["devops", "aws", "azure", "gcp"],
  "cybersecurity":         ["security engineering", "devops"],
  "game development":      ["unity", "unreal engine", "c#"],
  "mobile development":    ["ios", "android", "flutter", "react native"],
  "api design":            ["backend development", "rest", "graphql"],
};

// Build reverse related map so project terms can match user terms
const RELATED_MAP_REVERSE = new Map<string, Set<string>>();
for (const [source, targets] of Object.entries(RELATED_MAP)) {
  for (const target of targets) {
    const existing = RELATED_MAP_REVERSE.get(target);
    if (existing) {
      existing.add(source);
    } else {
      RELATED_MAP_REVERSE.set(target, new Set([source]));
    }
  }
}

// ── Core expansion ────────────────────────────────────────────────────────────

/**
 * Expand a single normalised term into all terms it should be compared against.
 * Returns sets keyed by tier so the caller can assign weights.
 */
export interface ExpandedTerm {
  canonical: string;
  aliases: Set<string>;     // alias tier
  related: Set<string>;     // related tier
}

export function expandRecommendationTerm(rawTerm: string): ExpandedTerm {
  const canonical = normalizeRecommendationTerm(rawTerm);

  const aliases = new Set<string>(ALIAS_MAP.get(canonical) ?? [canonical]);
  aliases.delete(canonical); // canonical is the exact match — keep separate

  const related = new Set<string>();
  // forward: what does this term relate to?
  for (const r of RELATED_MAP[canonical] ?? []) related.add(r);
  // reverse: what terms relate back to this one?
  for (const r of RELATED_MAP_REVERSE.get(canonical) ?? []) related.add(r);
  // also expand through aliases
  for (const alias of aliases) {
    for (const r of RELATED_MAP[alias] ?? []) related.add(r);
    for (const r of RELATED_MAP_REVERSE.get(alias) ?? []) related.add(r);
  }
  // remove canonical and aliases from related to avoid tier overlap
  related.delete(canonical);
  for (const a of aliases) related.delete(a);

  return { canonical, aliases, related };
}

/**
 * Expand an array of raw terms.
 * Returns one ExpandedTerm per unique normalised term.
 */
export function expandRecommendationTerms(rawTerms: string[]): ExpandedTerm[] {
  const seen = new Set<string>();
  const result: ExpandedTerm[] = [];
  for (const raw of rawTerms) {
    const expanded = expandRecommendationTerm(raw);
    if (!seen.has(expanded.canonical)) {
      seen.add(expanded.canonical);
      result.push(expanded);
    }
  }
  return result;
}

// ── Weighted overlap ──────────────────────────────────────────────────────────

/**
 * Compare a list of user expanded terms against a normalised set of project
 * terms. Returns all TermMatch records, one per (user term, project term) pair.
 *
 * Exact > alias > related — if a user term matches a project term at multiple
 * tiers only the strongest tier is kept.
 */
export function weightedOverlap(
  userExpanded: ExpandedTerm[],
  projectTermsRaw: string[],
): TermMatch[] {
  const projectNorm = projectTermsRaw.map(normalizeRecommendationTerm);
  const projectSet = new Set(projectNorm);

  const results: TermMatch[] = [];

  for (const userEntry of userExpanded) {
    let bestMatch: TermMatch | null = null;

    // 1. Exact tier
    if (projectSet.has(userEntry.canonical)) {
      bestMatch = {
        userTerm: userEntry.canonical,
        projectTerm: userEntry.canonical,
        tier: "exact",
        weight: TIER_WEIGHTS.exact,
      };
    }

    // 2. Alias tier (only if no exact already)
    if (!bestMatch) {
      for (const alias of userEntry.aliases) {
        if (projectSet.has(alias)) {
          bestMatch = {
            userTerm: userEntry.canonical,
            projectTerm: alias,
            tier: "alias",
            weight: TIER_WEIGHTS.alias,
          };
          break;
        }
      }
    }

    // 3. Related tier (only if nothing stronger found)
    if (!bestMatch) {
      for (const rel of userEntry.related) {
        if (projectSet.has(rel)) {
          bestMatch = {
            userTerm: userEntry.canonical,
            projectTerm: rel,
            tier: "related",
            weight: TIER_WEIGHTS.related,
          };
          break;
        }
      }
    }

    if (bestMatch) results.push(bestMatch);
  }

  return results;
}

/**
 * Sum the weights of a TermMatch array.
 * Used to compute a fractional "weighted match count" suitable for
 * the existing computeMatchPercentage formula.
 */
export function sumWeights(matches: TermMatch[]): number {
  return matches.reduce((acc, m) => acc + m.weight, 0);
}

/**
 * Return the user-facing display term for a match (title-cased original).
 * For related matches this is the *user* term (what the user has),
 * not the project term.
 */
export function matchDisplayLabel(match: TermMatch): string {
  // Convert canonical lowercase back to a readable form
  return match.userTerm
    .replace(/\b(ai\/ml)\b/gi, "AI/ML")
    .replace(/\bnode\.js\b/gi, "Node.js")
    .replace(/\bnext\.js\b/gi, "Next.js")
    .replace(/\bnuxt\.js\b/gi, "Nuxt.js")
    .replace(/\bvue\.js\b/gi, "Vue.js")
    .replace(/\bthree\.js\b/gi, "Three.js")
    .replace(/\bci\/cd\b/gi, "CI/CD")
    .replace(/\bui\/ux\b/gi, "UI/UX")
    .split(/\s+/)
    .map((w) => {
      const upper = ["api", "ml", "ai", "nlp", "sql", "aws", "gcp", "ios", "ux", "ui", "css", "html", "http", "jwt"];
      if (upper.includes(w.toLowerCase())) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ");
}
