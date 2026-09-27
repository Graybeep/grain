import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

export type ModelTier = "strong" | "fast";

/**
 * LLM_PROVIDER=anthropic (default): Claude for chat, OpenAI for embeddings.
 * LLM_PROVIDER=local: any OpenAI-compatible server (LM Studio, Ollama) at LOCAL_LLM_BASE_URL
 * for both chat and embeddings. No API keys needed.
 */
export type Provider = "anthropic" | "local";

export function provider(): Provider {
  return process.env.LLM_PROVIDER === "local" ? "local" : "anthropic";
}

let localClient: ReturnType<typeof createOpenAICompatible> | null = null;
function local() {
  localClient ??= createOpenAICompatible({
    name: "local",
    baseURL: process.env.LOCAL_LLM_BASE_URL ?? "http://localhost:1234/v1",
    supportsStructuredOutputs: true,
  });
  return localClient;
}

export function languageModel(tier: ModelTier) {
  const id =
    tier === "strong"
      ? (process.env.MODEL_STRONG ?? "claude-sonnet-5")
      : (process.env.MODEL_FAST ?? "claude-haiku-4-5-20251001");
  return provider() === "local" ? local().chatModel(id) : anthropic(id);
}

export const EMBED_DIMENSIONS = 512;

export function embedModelId(): string {
  return process.env.EMBED_MODEL ?? "text-embedding-3-small";
}

export function embeddingModel() {
  return provider() === "local" ? local().embeddingModel(embedModelId()) : openai.embedding(embedModelId());
}

export function hasLlmKey(): boolean {
  return provider() === "local" || Boolean(process.env.ANTHROPIC_API_KEY);
}

export function hasEmbedKey(): boolean {
  return provider() === "local" || Boolean(process.env.OPENAI_API_KEY);
}

/**
 * Per-call provider options. Local reasoning models (e.g. Qwen 3.5) think for minutes by
 * default, which blows the 45s stage budget; LOCAL_REASONING_EFFORT=none turns that off.
 */
export function chatProviderOptions() {
  if (provider() !== "local") return undefined;
  return { local: { reasoningEffort: process.env.LOCAL_REASONING_EFFORT ?? "none" } };
}
