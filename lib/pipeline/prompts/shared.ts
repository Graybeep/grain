// DRAFT prompts written by Claude Code at the human's request (2026-09-28). Human-owned: review and rewrite freely.
import type { BrandSpec } from "@/lib/schema/brandSpec";
import { CLICHES, FONT_PAIRINGS } from "@/lib/scoring/data";
import { LENGTH_LIMITS } from "@/lib/scoring/text";
import { selectedDirection } from "../selected";

export const STUDIO_ROLE =
  "You are part of an adversarial brand studio. Every decision you make must be specific to this founder's idea and defensible. " +
  "Be concrete, but never invent facts: no made-up names, cities, stores, numbers or schedules that the founder did not give. " +
  "Keep every sentence short. Never pad. Return only the requested JSON.";

export const BANNED = `Banned phrases (never use them or their variants): ${CLICHES.join(", ")}.`;

export const LIMITS = `Length limits: tagline ≤ ${LENGTH_LIMITS.tagline} words; hero headline ≤ ${LENGTH_LIMITS.heroHeadline} words; one-liner ≤ ${LENGTH_LIMITS.oneLiner} words.`;

export function json(value: unknown): string {
  return JSON.stringify(value, null, 1);
}

/** The idea brief plus any interview answers, paired with their questions. */
export function founderContext(spec: BrandSpec): string {
  const qa = (spec.interview?.questions ?? [])
    .map((q) => `- Q: ${q.question}\n  A: ${spec.interview?.answers[q.id]?.trim() || "(no answer)"}`)
    .join("\n");
  return `IDEA BRIEF\n${json(spec.idea)}${qa ? `\n\nFOUNDER INTERVIEW\n${qa}` : ""}`;
}

export function directionContext(spec: BrandSpec): string {
  return `SELECTED DIRECTION (founder's choice, with their edits)\n${json(selectedDirection(spec))}`;
}

export function fontOptions(): string {
  return FONT_PAIRINGS.map((p) => `- ${p.id}: ${p.heading} + ${p.body} [${p.traits.join(", ")}]`).join("\n");
}

/**
 * Every free-text field as `path: value`, using the exact path syntax Guardian may cite and revise
 * (e.g. verbal.voice.samples[2]). Small models reference fields far more reliably from this list.
 */
export function fieldListing(spec: BrandSpec, sections: ("verbal" | "visual" | "launch")[]): string {
  const lines: string[] = [];
  const walk = (value: unknown, path: string) => {
    if (typeof value === "string") lines.push(`${path}: ${value}`);
    else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`));
    else if (value && typeof value === "object") {
      for (const [k, v] of Object.entries(value)) {
        if (k === "genericness" || k === "contrastChecks") continue;
        walk(v, `${path}.${k}`);
      }
    }
  };
  for (const s of sections) walk(spec[s], s);
  return lines.join("\n");
}

export const REVISABLE_PATHS =
  "verbal.tagline.text, verbal.oneLiner, verbal.messageHierarchy.primary, verbal.messageHierarchy.supporting[i], " +
  "verbal.voice.principles[i] / do[i] / dont[i] / samples[i], visual.shapeLanguage, visual.imageryStyle, visual.logoBrief, visual.avoid[i], " +
  "launch.heroHeadline, launch.heroSub, launch.pitch, launch.socialPosts[i].text";

export const SEVERITY =
  "Severity: high = contradicts the chosen direction or uses an anti-trait outright; med = noticeably off-voice, off-trait or vague; low = minor polish.";
