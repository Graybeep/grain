/**
 * Offline step 2: embed every row of data/corpus-raw.csv once and write data/corpus.json.
 * Requires OPENAI_API_KEY. Never runs at request time.
 *
 *   npx tsx --env-file=.env.local scripts/build-corpus.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { embedTexts } from "@/lib/llm/embed";
import { EMBED_DIMENSIONS } from "@/lib/llm/models";
import { CorpusType, corpusPath, quantize, type CorpusFile } from "@/lib/scoring/corpus";
import { parseCsv } from "./lib/csv";

const BATCH = 256;

async function main(): Promise<void> {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  const [, ...rows] = parseCsv(readFileSync("data/corpus-raw.csv", "utf8"));
  const items = rows
    .filter((r) => r[0]?.trim())
    .map((r) => ({ text: r[0]!.trim(), type: CorpusType.parse(r[1]) }));

  const entries: CorpusFile["entries"] = [];
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH);
    const vectors = await embedTexts(chunk.map((c) => c.text));
    chunk.forEach((c, j) => entries.push({ ...c, e: quantize(vectors[j]!) }));
    process.stdout.write(`embedded ${Math.min(i + BATCH, items.length)}/${items.length}\n`);
  }

  const file: CorpusFile = {
    builtAt: new Date().toISOString(),
    source: "yc-oss/api (public Y Combinator company directory), see data/corpus-raw.csv",
    model: process.env.EMBED_MODEL ?? "text-embedding-3-small",
    dimensions: EMBED_DIMENSIONS,
    entries,
  };
  writeFileSync(corpusPath(), JSON.stringify(file));
  process.stdout.write(`Wrote ${entries.length} entries to data/corpus.json\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
