import { z } from "zod";
import { generateStructured } from "@/lib/llm/generate";
import { livePrompt } from "@/lib/pipeline/fixture";
import type { PromptInput, PromptKey } from "@/lib/pipeline/promptRegistry";
import { Revision, Violation, type BrandSpec, type Stage } from "@/lib/schema/brandSpec";

const Violations = z.object({ violations: z.array(Violation) });
const Revisions = z.object({ revisions: z.array(Revision) });
const SnippetCheck = z.object({ violations: z.array(Violation), suggestedRewrite: z.string() });

export function isBlocking(v: Violation): boolean {
  return v.severity === "high" || v.severity === "med";
}

/**
 * LLM cross-field check (traits ↔ voice ↔ copy ↔ visuals, anti-traits).
 * Returns null when the prompt isn't wired or there's no API key.
 */
export async function crossFieldCheck(spec: BrandSpec, key: PromptKey = "guardian", stage: Stage = "guardian"): Promise<Violation[] | null> {
  const prompt = livePrompt(key, stage);
  if (!prompt) return null;
  const { violations } = await generateStructured({ stage, tier: "strong", schema: Violations, ...prompt({ spec }) });
  return violations.map((v, i) => ({ ...v, id: `${key}-${i + 1}` }));
}

/** One revise pass: the model proposes text rewrites for the given violations. */
export async function proposeRevisions(spec: BrandSpec, violations: Violation[]): Promise<Revision[]> {
  const prompt = livePrompt("guardian-revise", "guardian");
  if (!prompt) return [];
  const { revisions } = await generateStructured({ stage: "guardian", tier: "strong", schema: Revisions, ...prompt({ spec, violations }) });
  return revisions;
}

/** Guardian paste-check for a snippet against a run's brand. Null when the prompt isn't wired. */
export async function checkSnippetWithLlm(input: Required<Pick<PromptInput, "spec" | "text" | "kind">>): Promise<z.infer<typeof SnippetCheck> | null> {
  const prompt = livePrompt("guardian-check", "guardian");
  if (!prompt) return null;
  return generateStructured({ stage: "guardian", tier: "strong", schema: SnippetCheck, ...prompt(input) });
}
