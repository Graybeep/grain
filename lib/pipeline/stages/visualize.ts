import { generateStructured } from "@/lib/llm/generate";
import { Visual } from "@/lib/schema/brandSpec";
import { contrastRatio, isHex, MIN_TEXT_CONTRAST } from "@/lib/scoring/contrast";
import { findFontPairing, FONT_PAIRINGS } from "@/lib/scoring/data";
import { FIXTURE_NOTE, goldenSpec, livePrompt } from "../fixture";
import { selectedDirection } from "../selected";
import type { StageRunner } from "../types";

const VisualDraft = Visual.omit({ contrastChecks: true });
type VisualDraft = ReturnType<typeof VisualDraft.parse>;

function checkDraft(v: VisualDraft): string | null {
  const problems: string[] = [];
  if (!findFontPairing(v.fontPairingId)) {
    problems.push(`fontPairingId must be one of: ${FONT_PAIRINGS.map((p) => p.id).join(", ")}.`);
  }
  const bad = v.palette.filter((c) => !isHex(c.hex)).map((c) => c.hex);
  if (bad.length) problems.push(`Invalid hex colors: ${bad.join(", ")}. Use #rrggbb.`);
  for (const role of ["bg", "text", "primary"] as const) {
    if (!v.palette.some((c) => c.role === role)) problems.push(`Palette needs a "${role}" color.`);
  }
  return problems.length ? problems.join(" ") : null;
}

/** Contrast is computed in code, never by the model: text, primary and accent against the background. */
export function computeContrastChecks(palette: Visual["palette"]): Visual["contrastChecks"] {
  const bg = palette.find((c) => c.role === "bg");
  if (!bg) return [];
  return palette
    .filter((c) => c.role === "text" || c.role === "primary" || c.role === "accent")
    .map((c) => {
      const ratio = contrastRatio(c.hex, bg.hex);
      return { fg: c.hex, bg: bg.hex, ratio, pass: ratio >= MIN_TEXT_CONTRAST };
    });
}

export const runVisualize: StageRunner = async (spec) => {
  const direction = selectedDirection(spec);
  const prompt = livePrompt("visualize", "visualize");

  const draft: VisualDraft = prompt
    ? await generateStructured({ stage: "visualize", tier: "fast", schema: VisualDraft, ...prompt({ spec }), refine: checkDraft })
    : goldenSpec().visual!;
  const visual: Visual = { ...draft, contrastChecks: computeContrastChecks(draft.palette) };

  const pairing = findFontPairing(visual.fontPairingId);
  const note = prompt ? "" : FIXTURE_NOTE;
  const traits = `directions[${direction.id}].traits`;
  return {
    patch: { visual },
    trail: [
      { field: "visual.fontPairingId", basedOn: [traits], reason: `${note}${pairing?.heading} + ${pairing?.body} (tags: ${pairing?.traits.join(", ")}).` },
      { field: "visual.palette", basedOn: [traits, "verbal.voice"], reason: `${note}${visual.palette.length} colors; ${visual.contrastChecks.filter((c) => !c.pass).length} contrast failure(s) for Guardian.` },
      { field: "visual.logoBrief", basedOn: [traits, "verbal.chosenName"], reason: `${note}Logo brief and shape language follow the direction's traits.` },
    ],
  };
};
