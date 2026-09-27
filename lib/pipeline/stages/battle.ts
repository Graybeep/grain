import { z } from "zod";
import { generateStructured } from "@/lib/llm/generate";
import { Critique, DirectionId, Perspective } from "@/lib/schema/brandSpec";
import { FIXTURE_NOTE, goldenSpec, livePrompt } from "../fixture";
import type { StageRunner } from "../types";

const Critiques = z.object({ critiques: z.array(Critique).length(9) });

function checkCoverage(critiques: Critique[]): string | null {
  const seen = new Set(critiques.map((c) => `${c.directionId}:${c.perspective}`));
  const missing = DirectionId.options.flatMap((d) =>
    Perspective.options.filter((p) => !seen.has(`${d}:${p}`)).map((p) => `${d}/${p}`),
  );
  return missing.length ? `Missing critiques for: ${missing.join(", ")}. Give exactly one per direction × perspective.` : null;
}

function average(critiques: Critique[], id: string): number {
  const mine = critiques.filter((c) => c.directionId === id);
  const total = mine.reduce((s, c) => s + c.scores.audienceFit + c.scores.distinctiveness + c.scores.credibility + c.scores.clarity, 0);
  return mine.length ? Math.round((total / (mine.length * 4)) * 10) / 10 : 0;
}

export const runBattle: StageRunner = async (spec) => {
  const prompt = livePrompt("battle", "battle");

  // One call covers all 3 perspectives × 3 directions (CLAUDE.md §5.1).
  const critiques = prompt
    ? (
        await generateStructured({
          stage: "battle",
          tier: "fast",
          schema: Critiques,
          ...prompt({ spec }),
          refine: (v) => checkCoverage(v.critiques),
        })
      ).critiques
    : goldenSpec().critiques!;

  const summary = DirectionId.options.map((id) => `${id} ${average(critiques, id)}`).join(", ");
  return {
    patch: { critiques },
    trail: [
      {
        field: "critiques",
        basedOn: ["directions", "idea.targetUser"],
        reason: `${prompt ? "" : FIXTURE_NOTE}Target user, skeptic and cliché hunter scored every direction (avg: ${summary}).`,
      },
    ],
  };
};
