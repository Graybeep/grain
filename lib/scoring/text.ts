import { CLICHES } from "./data";

export const LENGTH_LIMITS = {
  tagline: 8,
  heroHeadline: 12,
  oneLiner: 25,
} as const;

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Clichés found in `text`. Whole-word, case-insensitive, and hyphen/space variants ("next gen", "nextgen"). */
export function findCliches(text: string): string[] {
  return CLICHES.filter((phrase) => {
    const pattern = escapeRegex(phrase).replace(/-/g, "[-\\s]?");
    return new RegExp(`\\b${pattern}\\w*`, "i").test(text);
  });
}
