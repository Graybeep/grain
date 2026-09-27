/**
 * Offline step 1: download the public YC company directory (yc-oss/api, a public
 * mirror of Y Combinator's company listing) and write names + one-liners to
 * data/corpus-raw.csv. Never runs at request time.
 *
 *   npx tsx scripts/fetch-corpus.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { toCsv } from "./lib/csv";

const SOURCE = "https://yc-oss.github.io/api/companies/all.json";
const LIMIT = 2000;

const Company = z.object({
  name: z.string(),
  one_liner: z.string().nullable().optional(),
  launched_at: z.number().nullable().optional(),
});

async function main(): Promise<void> {
  const res = await fetch(SOURCE);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  const companies = z.array(Company).parse(await res.json());

  // Most recently launched first: recent startup language is what "generic" means today.
  const picked = companies
    .filter((c) => c.name.trim() && c.one_liner?.trim())
    .sort((a, b) => (b.launched_at ?? 0) - (a.launched_at ?? 0))
    .slice(0, LIMIT);

  const rows: string[][] = [["text", "type", "source"]];
  for (const c of picked) {
    rows.push([c.name.trim(), "name", "yc-oss"]);
    rows.push([(c.one_liner ?? "").trim(), "tagline", "yc-oss"]);
  }
  writeFileSync(join(process.cwd(), "data", "corpus-raw.csv"), toCsv(rows));
  process.stdout.write(`Wrote ${rows.length - 1} rows from ${picked.length} companies\n`);
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
