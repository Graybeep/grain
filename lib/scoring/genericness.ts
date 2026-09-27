import { AppError } from "@/lib/errors";
import { embedText } from "@/lib/llm/embed";
import { hasEmbedKey } from "@/lib/llm/models";
import { loadCorpus, type CorpusType } from "./corpus";

export interface GenericnessResult {
  score: number;
  band: "Generic" | "Familiar" | "Distinct";
  nearest: { text: string; sim: number }[];
}

// TODO(human): tune these on the fixtures (CLAUDE.md §7).
export const BANDS = { generic: 70, familiar: 50 } as const;

export function bandFor(score: number): GenericnessResult["band"] {
  if (score >= BANDS.generic) return "Generic";
  if (score >= BANDS.familiar) return "Familiar";
  return "Distinct";
}

export function genericnessAvailable(): boolean {
  return hasEmbedKey() && loadCorpus() !== null;
}

/** Cosine similarity of `text` against every corpus entry of the same type. */
export async function scoreGenericness(text: string, type: CorpusType): Promise<GenericnessResult> {
  const corpus = loadCorpus();
  if (!corpus) throw new AppError("internal", "data/corpus.json is missing; run `npm run build-corpus`");
  const q = await embedText(text);
  const qNorm = Math.sqrt(q.reduce((s, v) => s + v * v, 0)) || 1;

  const sims: { text: string; sim: number }[] = [];
  for (const entry of corpus) {
    if (entry.type !== type) continue;
    let dot = 0;
    for (let i = 0; i < entry.vec.length; i++) dot += (q[i] ?? 0) * (entry.vec[i] ?? 0);
    sims.push({ text: entry.text, sim: dot / (qNorm * (entry.norm || 1)) });
  }
  sims.sort((a, b) => b.sim - a.sim);

  const top = sims.slice(0, 3).map((s) => ({ text: s.text, sim: Math.round(s.sim * 1000) / 1000 }));
  const score = Math.max(0, Math.round((sims[0]?.sim ?? 0) * 100));
  return { score, band: bandFor(score), nearest: top };
}

/** CLAUDE.md §7 name check: the chosen name must not exactly match any corpus entry. */
export function nameExistsInCorpus(name: string): boolean {
  const corpus = loadCorpus();
  if (!corpus) return false;
  const needle = name.trim().toLowerCase();
  return corpus.some((e) => e.type === "name" && e.text.trim().toLowerCase() === needle);
}
