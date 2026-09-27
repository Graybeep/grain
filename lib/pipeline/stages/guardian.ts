import { runGuardian } from "@/lib/guardian/run";
import { FIXTURE_NOTE } from "../fixture";
import type { StageRunner } from "../types";

export const runGuardianStage: StageRunner = async (spec) => {
  const { spec: revised, report, llmChecked } = await runGuardian(spec);
  const note = llmChecked ? "" : `${FIXTURE_NOTE}Deterministic checks only (guardian prompt not wired yet). `;
  const fixedFields = [...new Set(report.revisions.map((r) => r.field))];

  return {
    // Guardian may revise verbal and visual fields, so both sections are written back.
    patch: { verbal: revised.verbal, visual: revised.visual, guardian: report },
    trail: [
      {
        field: "guardian",
        basedOn: ["verbal", "visual", "selection"],
        reason: `${note}${report.violations.length} violation(s) caught, ${report.revisions.length} revision(s) applied; ${report.passed ? "passed" : "still failing"}.`,
      },
      ...fixedFields.map((field) => ({ field, basedOn: ["guardian.violations"], reason: "Revised by Guardian." })),
    ],
  };
};
