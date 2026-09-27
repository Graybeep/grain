// TODO(human): this file is a verbatim transcription of CLAUDE.md §6, committed by
// Claude Code so the scaffold compiles. It is human-owned — review and take it over.
import { z } from "zod";

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

export const Stage = z.enum(STAGES);
export type Stage = z.infer<typeof Stage>;

export const StageStatus = z.enum(["pending", "running", "done", "error", "stale"]);
export type StageStatus = z.infer<typeof StageStatus>;

export const IdeaBrief = z.object({
  rawIdea: z.string(),
  problem: z.string(),
  targetUser: z.string(),
  context: z.string(),
  constraints: z.array(z.string()),
  assumptions: z.array(z.string()),
  openQuestions: z.array(z.string()),
});
export type IdeaBrief = z.infer<typeof IdeaBrief>;

export const InterviewQuestion = z.object({
  id: z.string(),
  question: z.string(),
  whyItMatters: z.string(),
});
export type InterviewQuestion = z.infer<typeof InterviewQuestion>;

export const Interview = z.object({
  questions: z.array(InterviewQuestion).max(3),
  answers: z.record(z.string(), z.string()),
});
export type Interview = z.infer<typeof Interview>;

export const DirectionId = z.enum(["A", "B", "C"]);
export type DirectionId = z.infer<typeof DirectionId>;

export const Axis = z.enum(["audience-wedge", "archetype", "tone"]);
export type Axis = z.infer<typeof Axis>;

export const Direction = z.object({
  id: DirectionId,
  label: z.string(),
  axis: Axis,
  positioning: z.string(),
  differentiator: z.string(),
  valueProp: z.string(),
  traits: z.array(z.object({ name: z.string(), justification: z.string() })).min(3).max(5),
  antiTraits: z.array(z.string()),
});
export type Direction = z.infer<typeof Direction>;

const Score = z.number().int().min(1).max(5);

export const Perspective = z.enum(["target-user", "skeptic", "cliche-hunter"]);
export type Perspective = z.infer<typeof Perspective>;

export const Critique = z.object({
  directionId: DirectionId,
  perspective: Perspective,
  scores: z.object({
    audienceFit: Score,
    distinctiveness: Score,
    credibility: Score,
    clarity: Score,
  }),
  strongestPoint: z.string(),
  objections: z.array(z.string()),
});
export type Critique = z.infer<typeof Critique>;

export const Selection = z.object({
  directionId: DirectionId,
  edits: Direction.partial().optional(),
});
export type Selection = z.infer<typeof Selection>;

export const Territory = z.enum(["descriptive", "invented", "metaphor", "compound"]);

export const Verbal = z.object({
  names: z.array(
    z.object({
      name: z.string(),
      territory: Territory,
      rationale: z.string(),
      genericness: z.number(),
    }),
  ),
  chosenName: z.string(),
  tagline: z.object({ text: z.string(), genericness: z.number() }),
  oneLiner: z.string(),
  messageHierarchy: z.object({ primary: z.string(), supporting: z.array(z.string()) }),
  voice: z.object({
    principles: z.array(z.string()),
    do: z.array(z.string()),
    dont: z.array(z.string()),
    samples: z.array(z.string()),
  }),
});
export type Verbal = z.infer<typeof Verbal>;

export const PaletteRole = z.enum(["primary", "secondary", "accent", "bg", "text"]);

export const Visual = z.object({
  fontPairingId: z.string(),
  palette: z.array(z.object({ name: z.string(), hex: z.string(), role: PaletteRole })),
  contrastChecks: z.array(
    z.object({ fg: z.string(), bg: z.string(), ratio: z.number(), pass: z.boolean() }),
  ),
  shapeLanguage: z.string(),
  imageryStyle: z.string(),
  logoBrief: z.string(),
  avoid: z.array(z.string()),
});
export type Visual = z.infer<typeof Visual>;

export const Severity = z.enum(["low", "med", "high"]);

export const Violation = z.object({
  id: z.string(),
  fields: z.array(z.string()),
  severity: Severity,
  rule: z.string(),
  explanation: z.string(),
  fix: z.string(),
});
export type Violation = z.infer<typeof Violation>;

export const Revision = z.object({
  field: z.string(),
  before: z.string(),
  after: z.string(),
  reason: z.string(),
});
export type Revision = z.infer<typeof Revision>;

export const GuardianReport = z.object({
  passed: z.boolean(),
  violations: z.array(Violation),
  revisions: z.array(Revision),
});
export type GuardianReport = z.infer<typeof GuardianReport>;

export const Launch = z.object({
  heroHeadline: z.string(),
  heroSub: z.string(),
  pitch: z.string(),
  socialPosts: z.array(
    z.object({ platform: z.enum(["linkedin", "x", "instagram"]), text: z.string() }),
  ),
});
export type Launch = z.infer<typeof Launch>;

export const TrailEntry = z.object({
  field: z.string(),
  stage: Stage,
  basedOn: z.array(z.string()),
  reason: z.string(),
});
export type TrailEntry = z.infer<typeof TrailEntry>;

export const BrandSpec = z.object({
  id: z.string(),
  createdAt: z.string(),
  stageStatus: z.record(Stage, StageStatus),
  idea: IdeaBrief.optional(),
  interview: Interview.optional(),
  directions: z.array(Direction).optional(),
  critiques: z.array(Critique).optional(),
  selection: Selection.optional(),
  verbal: Verbal.optional(),
  visual: Visual.optional(),
  guardian: GuardianReport.optional(),
  launch: Launch.optional(),
  trail: z.array(TrailEntry),
});
export type BrandSpec = z.infer<typeof BrandSpec>;
