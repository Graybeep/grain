/**
 * Checks that fixtures/run-sample.json is a valid BrandSpec whose computed fields
 * (contrast ratios, font pairing id) agree with the code. Run after editing fixtures.
 *
 *   npm run validate-fixtures
 */
import { readFileSync } from "node:fs";
import { z } from "zod";
import { BrandSpec } from "@/lib/schema/brandSpec";
import { contrastRatio } from "@/lib/scoring/contrast";
import { findFontPairing } from "@/lib/scoring/data";

const Idea = z.object({ id: z.string(), label: z.string(), rawIdea: z.string().min(10) });

const problems: string[] = [];

const spec = BrandSpec.safeParse(JSON.parse(readFileSync("fixtures/run-sample.json", "utf8")));
if (!spec.success) {
  problems.push(`run-sample.json: ${spec.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ")}`);
} else {
  const s = spec.data;
  for (const c of s.visual?.contrastChecks ?? []) {
    const actual = contrastRatio(c.fg, c.bg);
    if (Math.abs(actual - c.ratio) > 0.01 || c.pass !== actual >= 4.5) {
      problems.push(`contrast ${c.fg} on ${c.bg}: fixture says ${c.ratio}/${c.pass}, computed ${actual}`);
    }
  }
  if (s.visual && !findFontPairing(s.visual.fontPairingId)) problems.push(`unknown fontPairingId ${s.visual.fontPairingId}`);
  const missing = Object.entries(s.stageStatus).filter(([, v]) => v !== "done");
  if (missing.length) problems.push(`golden run has unfinished stages: ${missing.map(([k]) => k).join(", ")}`);
}

const ideas = z.array(Idea).length(3).safeParse(JSON.parse(readFileSync("fixtures/ideas.json", "utf8")));
if (!ideas.success) problems.push(`ideas.json: ${ideas.error.message}`);

if (problems.length) {
  process.stderr.write(`Fixture problems:\n- ${problems.join("\n- ")}\n`);
  process.exit(1);
}
process.stdout.write("Fixtures OK\n");
