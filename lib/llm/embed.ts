import { embed, embedMany } from "ai";
import { EMBED_DIMENSIONS, embeddingModel } from "./models";

const providerOptions = { openai: { dimensions: EMBED_DIMENSIONS } };

export async function embedText(value: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(), value, providerOptions });
  return embedding;
}

export async function embedTexts(values: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel(),
    values,
    providerOptions,
    maxParallelCalls: 4,
  });
  return embeddings;
}
