import cliches from "@/data/cliches.json";
import fontPairings from "@/data/font-pairings.json";

export interface FontPairing {
  id: string;
  heading: string;
  body: string;
  traits: string[];
}

export const CLICHES: readonly string[] = cliches;
export const FONT_PAIRINGS: readonly FontPairing[] = fontPairings;

export function findFontPairing(id: string): FontPairing | undefined {
  return FONT_PAIRINGS.find((p) => p.id === id);
}
