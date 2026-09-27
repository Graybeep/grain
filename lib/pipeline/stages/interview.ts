import { z } from "zod";
import { generateStructured } from "@/lib/llm/generate";
import { Interview } from "@/lib/schema/brandSpec";
import { FIXTURE_NOTE, goldenSpec, livePrompt } from "../fixture";
import type { StageRunner } from "../types";

const Questions = z.object({ questions: Interview.shape.questions });

export const runInterview: StageRunner = async (spec) => {
  const prompt = livePrompt("interview", "interview");

  if (!prompt) {
    return {
      patch: { interview: { questions: goldenSpec().interview!.questions, answers: {} } },
      trail: [{ field: "interview.questions", basedOn: ["idea"], reason: `${FIXTURE_NOTE}Sample questions (interview prompt not wired yet).` }],
    };
  }

  const { questions } = await generateStructured({
    stage: "interview",
    tier: "fast",
    schema: Questions,
    ...prompt({ spec }),
    refine: (v) => (new Set(v.questions.map((q) => q.id)).size === v.questions.length ? null : "Question ids must be unique."),
  });
  return {
    // Rerunning the interview asks new questions, so old answers no longer apply.
    patch: { interview: { questions, answers: {} } },
    trail: [{ field: "interview.questions", basedOn: ["idea.openQuestions", "idea.assumptions"], reason: `Asked ${questions.length} question(s) about the gaps that most change the brand.` }],
  };
};
