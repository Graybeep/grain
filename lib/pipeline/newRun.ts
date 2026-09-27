import { randomUUID } from "node:crypto";
import { STAGES, type BrandSpec, type Stage, type StageStatus } from "@/lib/schema/brandSpec";

/**
 * A fresh run. The raw idea is stored in `idea` with empty structured fields
 * until the intake stage fills them in.
 */
export function newRunSpec(rawIdea: string): BrandSpec {
  return {
    id: randomUUID().replace(/-/g, "").slice(0, 12),
    createdAt: new Date().toISOString(),
    stageStatus: Object.fromEntries(STAGES.map((s) => [s, "pending"])) as Record<Stage, StageStatus>,
    idea: { rawIdea, problem: "", targetUser: "", context: "", constraints: [], assumptions: [], openQuestions: [] },
    trail: [],
  };
}
