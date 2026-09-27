// DRAFT prompts written by Claude Code at the human's request (2026-09-28). Human-owned: review and rewrite freely.
// Stages 5–6 and 8: shape (verbal), visualize, launch.
import type { PromptBuilder } from "../promptRegistry";
import { BANNED, directionContext, fontOptions, founderContext, json, LIMITS, STUDIO_ROLE } from "./shared";

export const shapePrompt: PromptBuilder = ({ spec }) => ({
  instructions: `${STUDIO_ROLE}
Build the verbal identity for the selected direction only.
- names: 6 candidates, at least one per territory ("descriptive", "invented", "metaphor", "compound"). Short, pronounceable, not an existing well-known brand. rationale: why it fits the direction's traits.
- chosenName: the strongest candidate, copied exactly from names.
- tagline.text: a specific promise, not a slogan; it should be impossible to reuse for a different company.
- oneLiner: what it is, for whom, and the concrete outcome.
- messageHierarchy: primary (the one message) and 3 supporting proof points.
- voice: 3 principles that follow from the traits; 3 "do" and 3 "dont" writing rules; 3 samples written in the voice (real in-product or social lines, not descriptions of the voice).
Every line must sound like the traits and must never drift toward any anti-trait.
${LIMITS}
${BANNED}`,
  prompt: `${founderContext(spec)}\n\n${directionContext(spec)}`,
});

export const visualizePrompt: PromptBuilder = ({ spec }) => ({
  instructions: `${STUDIO_ROLE}
Design the visual system for the selected direction.
- fontPairingId: choose exactly one id from the list below, the one whose tags best match the traits.
- palette: exactly 5 colors, one per role: "bg", "text", "primary", "secondary", "accent". hex as #rrggbb. Name each color evocatively (e.g. "Ink Green"). Text on bg must be very high contrast; primary on bg should be readable too.
- shapeLanguage: the recurring forms (corners, lines, motifs) and why they fit.
- imageryStyle: what photos/illustration look like, concretely (subjects, light, framing).
- logoBrief: a brief a designer could execute (wordmark or symbol idea, how the name is set). Do not draw or output SVG.
- avoid: 3 visual clichés of this category the brand must not use.
The palette and type must express the traits and never the anti-traits.

FONT PAIRINGS
${fontOptions()}`,
  prompt: `${directionContext(spec)}\n\nBRAND NAME: ${spec.verbal?.chosenName ?? ""}\nVOICE\n${json(spec.verbal?.voice)}`,
});

export const launchPrompt: PromptBuilder = ({ spec }) => ({
  instructions: `${STUDIO_ROLE}
Write the launch kit using the brand's own voice rules and message hierarchy.
- heroHeadline: the primary message, sharpened. heroSub: one sentence of how it works, with a concrete detail.
- pitch: 3–4 sentences a founder could say out loud: problem, what it is, why now/why us.
- socialPosts: exactly 3 — one "linkedin", one "x" (≤ 280 characters), one "instagram". Each written natively for its platform and in the voice samples' style.
Follow every "do" and avoid every "dont" in the voice. Never express an anti-trait.
${LIMITS}
${BANNED}`,
  prompt: `${directionContext(spec)}\n\nVERBAL IDENTITY\n${json(spec.verbal)}`,
});
