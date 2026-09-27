import type { BrandSpec, Stage, Violation } from "@/lib/schema/brandSpec";

export type CheckKind = "tweet" | "headline" | "copy";

export interface PromptInput {
  spec: BrandSpec;
  /** guardian-revise: the violations to fix. */
  violations?: Violation[];
  /** guardian-check: the pasted text and its kind. */
  text?: string;
  kind?: CheckKind;
}

export interface PromptPair {
  instructions: string;
  prompt: string;
}

export type PromptBuilder = (input: PromptInput) => PromptPair;

export type PromptKey = Stage | "guardian-revise" | "launch-guardian" | "guardian-check";

/**
 * Prompt text is human-owned and lives in lib/pipeline/prompts/ (CLAUDE.md rule 3).
 * A stage with no registered prompt (or no ANTHROPIC_API_KEY) returns fixture output
 * so the app keeps working end to end.
 *
 * TODO(human): register each prompt as it lands, e.g.
 *   import { intakePrompt } from "./prompts/intake";
 *   intake: intakePrompt,
 */
export const PROMPTS: Partial<Record<PromptKey, PromptBuilder>> = {};

export function getPrompt(key: PromptKey): PromptBuilder | undefined {
  return PROMPTS[key];
}
