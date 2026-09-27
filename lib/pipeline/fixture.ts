import sample from "@/fixtures/run-sample.json";
import { log } from "@/lib/log";
import { hasLlmKey } from "@/lib/llm/models";
import { BrandSpec, type Stage } from "@/lib/schema/brandSpec";
import { getPrompt, type PromptBuilder, type PromptKey } from "./promptRegistry";

let golden: BrandSpec | null = null;

/** The golden run from fixtures/run-sample.json, validated once. */
export function goldenSpec(): BrandSpec {
  golden ??= BrandSpec.parse(sample);
  return structuredClone(golden);
}

/** Returns the prompt builder when a live LLM call is possible, else null (caller uses fixture output). */
export function livePrompt(key: PromptKey, stage: Stage): PromptBuilder | null {
  const builder = getPrompt(key);
  if (builder && hasLlmKey()) return builder;
  log.warn("stage using fixture output", { stage, key, reason: builder ? "no ANTHROPIC_API_KEY" : "no prompt registered" });
  return null;
}

export const FIXTURE_NOTE = "[fixture] ";
