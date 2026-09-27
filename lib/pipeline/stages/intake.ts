import { generateStructured } from "@/lib/llm/generate";
import { IdeaBrief } from "@/lib/schema/brandSpec";
import { FIXTURE_NOTE, goldenSpec, livePrompt } from "../fixture";
import type { StageRunner } from "../types";

export const runIntake: StageRunner = async (spec) => {
  const rawIdea = spec.idea?.rawIdea ?? "";
  const prompt = livePrompt("intake", "intake");

  if (!prompt) {
    const idea = { ...goldenSpec().idea!, rawIdea };
    return {
      patch: { idea },
      trail: [{ field: "idea", basedOn: ["idea.rawIdea"], reason: `${FIXTURE_NOTE}Sample idea brief (intake prompt not wired yet).` }],
    };
  }

  const brief = await generateStructured({ stage: "intake", tier: "fast", schema: IdeaBrief, ...prompt({ spec }) });
  return {
    // rawIdea is the user's words; never let the model rewrite it.
    patch: { idea: { ...brief, rawIdea } },
    trail: [{ field: "idea", basedOn: ["idea.rawIdea"], reason: "Structured the raw idea into problem, target user, context and constraints." }],
  };
};
