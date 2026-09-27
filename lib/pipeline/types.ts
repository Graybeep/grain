import type { BrandSpec, Stage, TrailEntry } from "@/lib/schema/brandSpec";

export type Section = "idea" | "interview" | "directions" | "critiques" | "verbal" | "visual" | "guardian" | "launch";

export interface StageOutput {
  patch: Partial<Pick<BrandSpec, Section>>;
  trail: Omit<TrailEntry, "stage">[];
}

export type StageRunner = (spec: BrandSpec) => Promise<StageOutput>;

export interface StageDef {
  run: StageRunner;
  /** Stages that must be `done` before this one can run. */
  requires: Stage[];
  /** Extra prerequisite beyond stage status, e.g. a user selection. Returns an error message or null. */
  check?: (spec: BrandSpec) => string | null;
}
