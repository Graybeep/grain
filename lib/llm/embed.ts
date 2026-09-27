import { embed, embedMany } from "ai";
import { EMBED_DIMENSIONS, embeddingModel } from "./models";

const providerOptions = { openai: { dimensions: EMBED_DIMENSIONS } };

// Some local embedding models expect a task prefix (nomic-embed-text: "clustering: ").
const prefix = () => process.env.EMBED_PREFIX ?? "";

export async function embedText(value: string): Promise<number[]> {
  const { embedding } = await embed({ model: embeddingModel(), value: prefix() + value, providerOptions });
  return embedding;
}

export async function embedTexts(values: string[]): Promise<number[][]> {
  const { embeddings } = await embedMany({
    model: embeddingModel(),
    values: values.map((v) => prefix() + v),
    providerOptions,
    maxParallelCalls: 4,
  });
  return embeddings;
}
