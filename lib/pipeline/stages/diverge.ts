import { z } from "zod";
import { generateStructured } from "@/lib/llm/generate";
import { Direction } from "@/lib/schema/brandSpec";
import { FIXTURE_NOTE, goldenSpec, livePrompt } from "../fixture";
import type { StageRunner } from "../types";

const Directions = z.object({ directions: z.array(Direction).length(3) });

function checkDirections(directions: Direction[]): string | null {
  const ids = directions.map((d) => d.id).sort().join("");
  if (ids !== "ABC") return "Directions must have ids A, B and C exactly once each.";
  if (new Set(directions.map((d) => d.axis)).size !== 3) {
    return "Each direction must use a different axis: one audience-wedge, one archetype, one tone.";
  }
  return null;
}

export const runDiverge: StageRunner = async (spec) => {
  const prompt = livePrompt("diverge", "diverge");

  if (!prompt) {
    return {
      patch: { directions: goldenSpec().directions! },
      trail: [{ field: "directions", basedOn: ["idea", "interview.answers"], reason: `${FIXTURE_NOTE}Sample directions (diverge prompt not wired yet).` }],
    };
  }

  const { directions } = await generateStructured({
    stage: "diverge",
    tier: "strong",
    schema: Directions,
    ...prompt({ spec }),
    refine: (v) => checkDirections(v.directions),
  });
  const sorted = [...directions].sort((a, b) => a.id.localeCompare(b.id));
  return {
    patch: { directions: sorted },
    trail: sorted.map((d) => ({
      field: `directions[${d.id}]`,
      basedOn: ["idea", "interview.answers"],
      reason: `Direction ${d.id} "${d.label}" diverges on the ${d.axis} axis.`,
    })),
  };
};
