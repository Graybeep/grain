import type { BrandSpec, Stage, Violation } from "@/lib/schema/brandSpec";
import { battlePrompt, divergePrompt, intakePrompt, interviewPrompt } from "./prompts/early";
import { guardianCheckPrompt, guardianPrompt, guardianRevisePrompt, launchGuardianPrompt } from "./prompts/guardian";
import { launchPrompt, shapePrompt, visualizePrompt } from "./prompts/identity";

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
 * TODO(human): the prompts below are DRAFTS written by Claude Code at your request; review and rewrite them.
 * Remove a key to send that stage back to fixture output.
 */
export const PROMPTS: Partial<Record<PromptKey, PromptBuilder>> = {
  intake: intakePrompt,
  interview: interviewPrompt,
  diverge: divergePrompt,
  battle: battlePrompt,
  shape: shapePrompt,
  visualize: visualizePrompt,
  guardian: guardianPrompt,
  "guardian-revise": guardianRevisePrompt,
  launch: launchPrompt,
  "launch-guardian": launchGuardianPrompt,
  "guardian-check": guardianCheckPrompt,
};

export function getPrompt(key: PromptKey): PromptBuilder | undefined {
  return PROMPTS[key];
}
