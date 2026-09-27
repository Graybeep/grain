export const STAGES = [
  "intake",
  "interview",
  "diverge",
  "battle",
  "shape",
  "visualize",
  "guardian",
  "launch",
] as const;

export type Stage = (typeof STAGES)[number];
export type StageStatus = "pending" | "running" | "done" | "error" | "stale";

export interface IdeaBrief {
  rawIdea: string;
  problem: string;
  targetUser: string;
  context: string;
  constraints: string[];
  assumptions: string[];
  openQuestions: string[];
}

export interface InterviewQuestion { id: string; question: string; whyItMatters: string }
export interface Interview { questions: InterviewQuestion[]; answers: Record<string, string> }

export interface Direction {
  id: "A" | "B" | "C";
  label: string;
  axis: "audience-wedge" | "archetype" | "tone";
  positioning: string;
  differentiator: string;
  valueProp: string;
  traits: { name: string; justification: string }[];
  antiTraits: string[];
}

export interface Critique {
  directionId: Direction["id"];
  perspective: "target-user" | "skeptic" | "cliche-hunter";
  scores: { audienceFit: number; distinctiveness: number; credibility: number; clarity: number };
  strongestPoint: string;
  objections: string[];
}

export interface Selection { directionId: Direction["id"]; edits?: Partial<Direction> }
export interface NameOption { name: string; territory: "descriptive" | "invented" | "metaphor" | "compound"; rationale: string; genericness: number }
export interface Verbal {
  names: NameOption[];
  chosenName: string;
  tagline: { text: string; genericness: number };
  oneLiner: string;
  messageHierarchy: { primary: string; supporting: string[] };
  voice: { principles: string[]; do: string[]; dont: string[]; samples: string[] };
}

export interface Visual {
  fontPairingId: string;
  palette: { name: string; hex: string; role: "primary" | "secondary" | "accent" | "bg" | "text" }[];
  contrastChecks: { fg: string; bg: string; ratio: number; pass: boolean }[];
  shapeLanguage: string;
  imageryStyle: string;
  logoBrief: string;
  avoid: string[];
}

export interface Violation { id: string; fields: string[]; severity: "low" | "med" | "high"; rule: string; explanation: string; fix: string }
export interface GuardianReport {
  passed: boolean;
  violations: Violation[];
  revisions: { field: string; before: string; after: string; reason: string }[];
}

export interface Launch {
  heroHeadline: string;
  heroSub: string;
  pitch: string;
  socialPosts: { platform: "linkedin" | "x" | "instagram"; text: string }[];
}

export interface TrailEntry { field: string; stage: Stage; basedOn: string[]; reason: string }
export interface BrandSpec {
  id: string;
  createdAt: string;
  stageStatus: Record<Stage, StageStatus>;
  idea?: IdeaBrief;
  interview?: Interview;
  directions?: Direction[];
  critiques?: Critique[];
  selection?: Selection;
  verbal?: Verbal;
  visual?: Visual;
  guardian?: GuardianReport;
  launch?: Launch;
  trail: TrailEntry[];
}

export interface ApiErrorPayload { error: { code: string; message: string; stage?: Stage } }
export interface StageResult { spec: BrandSpec; stage: Stage; durationMs: number }
export interface GuardianCheckResult { passed: boolean; violations: Violation[]; suggestedRewrite: string }

