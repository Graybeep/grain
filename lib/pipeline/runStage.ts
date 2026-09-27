import { getRun, saveRun } from "@/lib/db/runs";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { STAGES, type BrandSpec, type Stage } from "@/lib/schema/brandSpec";
import { runBattle } from "./stages/battle";
import { runDiverge } from "./stages/diverge";
import { runGuardianStage } from "./stages/guardian";
import { runIntake } from "./stages/intake";
import { runInterview } from "./stages/interview";
import { runLaunch } from "./stages/launch";
import { runShape } from "./stages/shape";
import { runVisualize } from "./stages/visualize";
import type { StageDef } from "./types";

export const STAGE_DEFS: Record<Stage, StageDef> = {
  intake: { run: runIntake, requires: [] },
  interview: { run: runInterview, requires: ["intake"] },
  diverge: { run: runDiverge, requires: ["interview"] },
  battle: { run: runBattle, requires: ["diverge"] },
  shape: {
    run: runShape,
    requires: ["battle"],
    check: (spec) => (spec.selection ? null : "Choose a direction before running shape"),
  },
  visualize: { run: runVisualize, requires: ["shape"] },
  guardian: { run: runGuardianStage, requires: ["visualize"] },
  launch: { run: runLaunch, requires: ["guardian"] },
};

/** Marks every stage after `stage` that has output as stale (CLAUDE.md §5.2). Mutates `spec`. */
export function markDownstreamStale(spec: BrandSpec, stage: Stage): void {
  for (const later of STAGES.slice(STAGES.indexOf(stage) + 1)) {
    if (spec.stageStatus[later] === "done" || spec.stageStatus[later] === "error") spec.stageStatus[later] = "stale";
  }
}

function assertPrerequisites(spec: BrandSpec, stage: Stage): void {
  const def = STAGE_DEFS[stage];
  const missing = def.requires.filter((s) => spec.stageStatus[s] !== "done");
  if (missing.length) {
    throw new AppError("missing_prerequisite", `Stage "${stage}" needs ${missing.join(", ")} to be done first`, stage);
  }
  const extra = def.check?.(spec);
  if (extra) throw new AppError("missing_prerequisite", extra, stage);
}

export interface RunStageResult {
  spec: BrandSpec;
  stage: Stage;
  durationMs: number;
}

/** Load → check prerequisites → run → validate → save. Rerunning overwrites this stage and stales later ones. */
export async function runStage(id: string, stage: Stage): Promise<RunStageResult> {
  const started = Date.now();
  const spec = await getRun(id);
  assertPrerequisites(spec, stage);

  spec.stageStatus[stage] = "running";
  await saveRun(spec);

  try {
    const output = await STAGE_DEFS[stage].run(spec);
    const next: BrandSpec = {
      ...spec,
      ...output.patch,
      stageStatus: { ...spec.stageStatus, [stage]: "done" },
      trail: [...spec.trail.filter((t) => t.stage !== stage), ...output.trail.map((t) => ({ ...t, stage }))],
    };
    markDownstreamStale(next, stage);
    const saved = await saveRun(next);
    const durationMs = Date.now() - started;
    log.info("stage done", { id, stage, durationMs });
    return { spec: saved, stage, durationMs };
  } catch (err) {
    log.error("stage failed", { id, stage, error: err instanceof Error ? err.message : String(err) });
    spec.stageStatus[stage] = "error";
    await saveRun(spec).catch(() => undefined);
    throw err;
  }
}
