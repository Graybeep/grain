import { generateText, NoObjectGeneratedError, Output } from "ai";
import type { z } from "zod";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import type { Stage } from "@/lib/schema/brandSpec";
import { chatProviderOptions, languageModel, type ModelTier } from "./models";

export interface StructuredCall<T extends z.ZodType> {
  stage: Stage;
  tier: ModelTier;
  schema: T;
  instructions: string;
  prompt: string;
  /** Extra validation beyond the schema (e.g. "axes must be unique"). Return an error message or null. */
  refine?: (value: z.infer<T>) => string | null;
  /** "soft": if `refine` still fails after the retry, return the last value instead of throwing (Guardian flags it later). */
  refineMode?: "strict" | "soft";
}

/**
 * Structured generation with the repo's retry policy (CLAUDE.md rule 4):
 * on a validation failure, retry once with the error fed back to the model;
 * on a second failure, throw a typed `llm_invalid` error.
 */
export async function generateStructured<T extends z.ZodType>(call: StructuredCall<T>): Promise<z.infer<T>> {
  let feedback: string | null = null;
  let lastValue: { value: z.infer<T> } | null = null;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const prompt: string =
      feedback === null
        ? call.prompt
        : `${call.prompt}\n\nYour previous answer was rejected by validation:\n${feedback}\nReturn a corrected answer that satisfies the schema.`;
    try {
      const { output } = await generateText({
        model: languageModel(call.tier),
        instructions: call.instructions,
        prompt,
        output: Output.object({ schema: call.schema }),
        providerOptions: chatProviderOptions(),
      });
      const value = output as z.infer<T>;
      lastValue = { value };
      const refineError = call.refine?.(value) ?? null;
      if (refineError === null) return value;
      feedback = refineError;
    } catch (err) {
      if (!NoObjectGeneratedError.isInstance(err)) throw err;
      feedback = err.cause instanceof Error ? err.cause.message : err.message;
    }
    log.warn("llm output failed validation", { stage: call.stage, attempt, feedback });
  }

  if (call.refineMode === "soft" && lastValue) return lastValue.value;
  throw new AppError("llm_invalid", `Model output failed validation twice: ${feedback ?? "unknown"}`, call.stage);
}
