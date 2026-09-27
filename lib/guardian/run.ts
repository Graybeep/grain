import type { BrandSpec, GuardianReport, Violation } from "@/lib/schema/brandSpec";
import { genericnessAvailable, scoreGenericness } from "@/lib/scoring/genericness";
import { runDeterministicChecks } from "./deterministic";
import { crossFieldCheck, isBlocking, proposeRevisions } from "./llm";
import { applyRevisions } from "./revise";

export interface GuardianResult {
  spec: BrandSpec;
  report: GuardianReport;
  llmChecked: boolean;
}

const violationKey = (v: Violation) => `${v.rule}|${[...v.fields].sort().join(",")}`;

/**
 * CLAUDE.md §7 Guardian: deterministic checks → LLM cross-field check →
 * at most one revise pass if anything is med/high → check again.
 * `violations` lists everything caught (including what was then fixed); `passed` reflects the final state.
 */
export async function runGuardian(input: BrandSpec): Promise<GuardianResult> {
  const det = runDeterministicChecks(input);
  let spec = det.spec;
  const llm = await crossFieldCheck(spec);
  const caught: Violation[] = [...det.violations, ...(llm ?? [])];
  const revisions = [...det.revisions];

  // Contrast is already fixed in code; everything else that blocks goes to the revise pass.
  const open = caught.filter((v) => isBlocking(v) && v.rule !== "contrast");
  let remaining = open;

  if (open.length && llm !== null) {
    const result = applyRevisions(spec, await proposeRevisions(spec, open));
    spec = result.spec;
    revisions.push(...result.applied);

    if (result.applied.some((r) => r.field === "verbal.tagline.text") && spec.verbal && genericnessAvailable()) {
      spec.verbal.tagline.genericness = (await scoreGenericness(spec.verbal.tagline.text, "tagline")).score;
    }

    const recheck = [...runDeterministicChecks(spec).violations, ...((await crossFieldCheck(spec)) ?? [])];
    remaining = recheck.filter(isBlocking);
    const seen = new Set(caught.map(violationKey));
    caught.push(...recheck.filter((v) => !seen.has(violationKey(v))));
  }

  return {
    spec,
    report: { passed: remaining.length === 0, violations: caught, revisions },
    llmChecked: llm !== null,
  };
}
