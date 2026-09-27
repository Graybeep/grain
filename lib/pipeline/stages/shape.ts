import { z } from "zod";
import { generateStructured } from "@/lib/llm/generate";
import { Verbal } from "@/lib/schema/brandSpec";
import { findCliches, LENGTH_LIMITS, wordCount } from "@/lib/scoring/text";
import { genericnessAvailable, scoreGenericness } from "@/lib/scoring/genericness";
import { log } from "@/lib/log";
import { FIXTURE_NOTE, goldenSpec, livePrompt } from "../fixture";
import { selectedDirection } from "../selected";
import type { StageRunner } from "../types";

// What the model writes; genericness is measured in code afterwards.
const VerbalDraft = Verbal.extend({
  names: z.array(Verbal.shape.names.element.omit({ genericness: true })).min(3),
  tagline: z.object({ text: z.string() }),
});
type VerbalDraft = z.infer<typeof VerbalDraft>;

function checkDraft(v: VerbalDraft): string | null {
  const problems: string[] = [];
  if (!v.names.some((n) => n.name === v.chosenName)) problems.push("chosenName must be one of the names.");
  if (wordCount(v.tagline.text) > LENGTH_LIMITS.tagline) problems.push(`Tagline must be at most ${LENGTH_LIMITS.tagline} words.`);
  if (wordCount(v.oneLiner) > LENGTH_LIMITS.oneLiner) problems.push(`One-liner must be at most ${LENGTH_LIMITS.oneLiner} words.`);
  const cliches = [v.tagline.text, ...v.voice.samples].flatMap(findCliches);
  if (cliches.length) problems.push(`Remove these banned clichés: ${[...new Set(cliches)].join(", ")}.`);
  return problems.length ? problems.join(" ") : null;
}

export const runShape: StageRunner = async (spec) => {
  const direction = selectedDirection(spec);
  const prompt = livePrompt("shape", "shape");

  if (!prompt) {
    return {
      patch: { verbal: goldenSpec().verbal! },
      trail: [{ field: "verbal", basedOn: [`directions[${direction.id}]`], reason: `${FIXTURE_NOTE}Sample verbal identity (shape prompt not wired yet).` }],
    };
  }

  // Length and cliché problems get one retry; if they survive, Guardian reports them.
  const draft = await generateStructured({
    stage: "shape",
    tier: "strong",
    schema: VerbalDraft,
    ...prompt({ spec }),
    refine: checkDraft,
    refineMode: "soft",
  });

  const measure = async (text: string, type: "name" | "tagline"): Promise<number> => {
    if (!genericnessAvailable()) {
      log.warn("genericness unavailable (corpus or OPENAI_API_KEY missing); scoring -1", { text });
      return -1;
    }
    return (await scoreGenericness(text, type)).score;
  };

  const [names, taglineScore] = await Promise.all([
    Promise.all(draft.names.map(async (n) => ({ ...n, genericness: await measure(n.name, "name") }))),
    measure(draft.tagline.text, "tagline"),
  ]);
  const verbal: Verbal = { ...draft, names, tagline: { text: draft.tagline.text, genericness: taglineScore } };

  const basedOn = [`directions[${direction.id}].positioning`, `directions[${direction.id}].traits`];
  const chosen = names.find((n) => n.name === verbal.chosenName);
  return {
    patch: { verbal },
    trail: [
      { field: "verbal.names", basedOn, reason: `Generated ${names.length} names across territories; each scored against the corpus.` },
      { field: "verbal.chosenName", basedOn: [...basedOn, "verbal.names"], reason: `${verbal.chosenName} chosen (genericness ${chosen?.genericness ?? "n/a"}).` },
      { field: "verbal.tagline", basedOn: [...basedOn, "idea.targetUser"], reason: `Tagline genericness ${taglineScore}.` },
      { field: "verbal.voice", basedOn: [`directions[${direction.id}].traits`, `directions[${direction.id}].antiTraits`], reason: "Voice principles derived from the selected direction's traits and anti-traits." },
    ],
  };
};
