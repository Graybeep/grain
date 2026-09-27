/**
 * Guardian evaluation (CLAUDE.md §7): each case in fixtures/guardian-cases.json takes the
 * golden run, applies a patch that plants a known violation, and checks that Guardian
 * reports a violation on at least one of the expected fields. Bar: ≥ 12 of 15 caught.
 *
 *   npm run eval-guardian
 */
import { readFileSync } from "node:fs";
import { z } from "zod";
import { goldenSpec } from "@/lib/pipeline/fixture";
import { runGuardian } from "@/lib/guardian/run";
import { BrandSpec } from "@/lib/schema/brandSpec";

const Case = z.object({
  id: z.string(),
  description: z.string(),
  /** Deep-merged onto the golden run. Arrays replace; objects merge. */
  patch: z.record(z.string(), z.unknown()),
  /** Caught if any violation's field starts with one of these paths. */
  expectFields: z.array(z.string()).min(1),
});

const BAR = 12;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function deepMerge(base: unknown, patch: unknown): unknown {
  if (!isObject(base) || !isObject(patch)) return patch;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) out[k] = deepMerge(base[k], v);
  return out;
}

async function main(): Promise<void> {
  const cases = z.array(Case).parse(JSON.parse(readFileSync("fixtures/guardian-cases.json", "utf8")));
  let caught = 0;

  for (const c of cases) {
    // Evaluate the Guardian stage's input: everything up to visualize, no prior report or launch.
    const golden = goldenSpec();
    delete golden.guardian;
    delete golden.launch;
    const spec = BrandSpec.parse(deepMerge(golden, c.patch));
    const { report } = await runGuardian(spec);
    const hitFields = report.violations.flatMap((v) => v.fields);
    const hit = c.expectFields.some((exp) => hitFields.some((f) => f.startsWith(exp)));
    if (hit) caught++;
    process.stdout.write(`${hit ? "CAUGHT" : "MISSED"}  ${c.id}  ${c.description}\n`);
    if (!hit) process.stdout.write(`        expected ${c.expectFields.join(" | ")}; got ${hitFields.join(", ") || "nothing"}\n`);
  }

  process.stdout.write(`\n${caught}/${cases.length} caught (bar: ${BAR}/15)\n`);
  if (cases.length >= 15 && caught < BAR) process.exit(1);
}

main().catch((err: unknown) => {
  process.stderr.write(`${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(1);
});
