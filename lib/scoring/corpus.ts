import { readFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";

export const CorpusType = z.enum(["name", "tagline"]);
export type CorpusType = z.infer<typeof CorpusType>;

/**
 * data/corpus.json. Embeddings are int8-quantized (scaled by each vector's max |x|)
 * and base64-encoded to keep the file small; cosine similarity is scale-invariant.
 */
export const CorpusFile = z.object({
  builtAt: z.string(),
  source: z.string(),
  model: z.string(),
  dimensions: z.number(),
  entries: z.array(z.object({ text: z.string(), type: CorpusType, e: z.string() })),
});
export type CorpusFile = z.infer<typeof CorpusFile>;

export interface CorpusEntry {
  text: string;
  type: CorpusType;
  vec: Int8Array;
  norm: number;
}

export function quantize(vec: number[]): string {
  const max = Math.max(...vec.map(Math.abs)) || 1;
  const q = Int8Array.from(vec, (x) => Math.round((x / max) * 127));
  return Buffer.from(q.buffer).toString("base64");
}

function dequantize(b64: string): Int8Array {
  const buf = Buffer.from(b64, "base64");
  return new Int8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

let cache: CorpusEntry[] | null = null;

export function corpusPath(): string {
  return join(process.cwd(), "data", "corpus.json");
}

/** Loads data/corpus.json once per process. Returns null if the corpus hasn't been built. */
export function loadCorpus(): CorpusEntry[] | null {
  if (cache) return cache;
  let raw: string;
  try {
    raw = readFileSync(corpusPath(), "utf8");
  } catch {
    return null;
  }
  const file = CorpusFile.parse(JSON.parse(raw));
  cache = file.entries.map((e) => {
    const vec = dequantize(e.e);
    let sum = 0;
    for (const v of vec) sum += v * v;
    return { text: e.text, type: e.type, vec, norm: Math.sqrt(sum) };
  });
  return cache;
}
