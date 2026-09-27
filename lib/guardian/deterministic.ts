import type { BrandSpec, Revision, Violation } from "@/lib/schema/brandSpec";
import { adjustForContrast, contrastRatio, MIN_TEXT_CONTRAST } from "@/lib/scoring/contrast";
import { nameExistsInCorpus } from "@/lib/scoring/genericness";
import { findCliches, LENGTH_LIMITS, wordCount } from "@/lib/scoring/text";

export interface DeterministicResult {
  violations: Violation[];
  revisions: Revision[];
  /** The spec with code-level fixes (contrast) applied. */
  spec: BrandSpec;
}

interface TextField {
  path: string;
  text: string;
  limit?: number;
  cliches: boolean;
}

function textFields(spec: BrandSpec): TextField[] {
  const fields: TextField[] = [];
  const v = spec.verbal;
  if (v) {
    fields.push({ path: "verbal.tagline.text", text: v.tagline.text, limit: LENGTH_LIMITS.tagline, cliches: true });
    fields.push({ path: "verbal.oneLiner", text: v.oneLiner, limit: LENGTH_LIMITS.oneLiner, cliches: false });
    v.voice.samples.forEach((s, i) => fields.push({ path: `verbal.voice.samples[${i}]`, text: s, cliches: true }));
  }
  if (spec.launch) {
    fields.push({ path: "launch.heroHeadline", text: spec.launch.heroHeadline, limit: LENGTH_LIMITS.heroHeadline, cliches: true });
  }
  return fields;
}

/**
 * CLAUDE.md §7 deterministic checks. These run before any LLM check.
 * `scope` limits the text checks to fields under a prefix (e.g. "launch.") and skips contrast and name checks.
 */
export function runDeterministicChecks(input: BrandSpec, scope?: string): DeterministicResult {
  const spec = structuredClone(input);
  const violations: Violation[] = [];
  const revisions: Revision[] = [];
  let n = 0;
  const id = (rule: string) => `det-${rule}-${++n}`;

  // Contrast: fix the text color in code and record the change as a revision.
  const palette = spec.visual?.palette ?? [];
  const bg = palette.find((c) => c.role === "bg");
  if (spec.visual && bg && !scope) {
    palette.forEach((c, i) => {
      if (c.role !== "text") return;
      const ratio = contrastRatio(c.hex, bg.hex);
      if (ratio >= MIN_TEXT_CONTRAST) return;
      const fixed = adjustForContrast(c.hex, bg.hex);
      violations.push({
        id: id("contrast"),
        fields: [`visual.palette[${i}].hex`],
        severity: "high",
        rule: "contrast",
        explanation: `Text ${c.hex} on background ${bg.hex} is ${ratio}:1, below ${MIN_TEXT_CONTRAST}:1.`,
        fix: `Use ${fixed} (${contrastRatio(fixed, bg.hex)}:1).`,
      });
      revisions.push({
        field: `visual.palette[${i}].hex`,
        before: c.hex,
        after: fixed,
        reason: "Adjusted lightness in code to meet WCAG AA text contrast.",
      });
      c.hex = fixed;
    });
    spec.visual.contrastChecks = spec.visual.contrastChecks.map((chk) => {
      const fg = revisions.find((r) => r.before === chk.fg)?.after ?? chk.fg;
      const ratio = contrastRatio(fg, chk.bg);
      return { fg, bg: chk.bg, ratio, pass: ratio >= MIN_TEXT_CONTRAST };
    });
  }

  for (const f of textFields(spec)) {
    if (scope && !f.path.startsWith(scope)) continue;
    if (f.cliches) {
      const hits = findCliches(f.text);
      if (hits.length) {
        violations.push({
          id: id("cliche"),
          fields: [f.path],
          severity: "med",
          rule: "cliche",
          explanation: `Uses banned cliché(s): ${hits.join(", ")}.`,
          fix: "Replace with a concrete, specific claim.",
        });
      }
    }
    if (f.limit !== undefined && wordCount(f.text) > f.limit) {
      violations.push({
        id: id("length"),
        fields: [f.path],
        severity: "med",
        rule: "length",
        explanation: `${wordCount(f.text)} words; the limit is ${f.limit}.`,
        fix: `Cut to ${f.limit} words or fewer.`,
      });
    }
  }

  if (spec.verbal && !scope && nameExistsInCorpus(spec.verbal.chosenName)) {
    violations.push({
      id: id("name"),
      fields: ["verbal.chosenName"],
      severity: "high",
      rule: "name-exists",
      explanation: `"${spec.verbal.chosenName}" exactly matches an existing company name in the corpus.`,
      fix: "Pick another name from verbal.names or generate a new one.",
    });
  }

  return { violations, revisions, spec };
}

/** Deterministic checks for a pasted snippet (POST /api/guardian/check). */
export function checkSnippet(text: string, kind: "tweet" | "headline" | "copy"): Violation[] {
  const violations: Violation[] = [];
  const hits = findCliches(text);
  if (hits.length) {
    violations.push({
      id: "det-cliche-1",
      fields: ["text"],
      severity: "med",
      rule: "cliche",
      explanation: `Uses banned cliché(s): ${hits.join(", ")}.`,
      fix: "Replace with a concrete, specific claim.",
    });
  }
  if (kind === "headline" && wordCount(text) > LENGTH_LIMITS.heroHeadline) {
    violations.push({
      id: "det-length-1",
      fields: ["text"],
      severity: "med",
      rule: "length",
      explanation: `${wordCount(text)} words; headlines are limited to ${LENGTH_LIMITS.heroHeadline}.`,
      fix: "Shorten the headline.",
    });
  }
  if (kind === "tweet" && text.length > 280) {
    violations.push({
      id: "det-length-1",
      fields: ["text"],
      severity: "high",
      rule: "length",
      explanation: `${text.length} characters; X posts are limited to 280.`,
      fix: "Shorten the post.",
    });
  }
  return violations;
}
