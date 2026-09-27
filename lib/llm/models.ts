import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";

export type ModelTier = "strong" | "fast";

export function languageModel(tier: ModelTier) {
  const id =
    tier === "strong"
      ? (process.env.MODEL_STRONG ?? "claude-sonnet-5")
      : (process.env.MODEL_FAST ?? "claude-haiku-4-5-20251001");
  return anthropic(id);
}

export const EMBED_DIMENSIONS = 512;

export function embeddingModel() {
  return openai.embedding(process.env.EMBED_MODEL ?? "text-embedding-3-small");
}

export function hasLlmKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function hasEmbedKey(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}
