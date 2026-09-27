// DRAFT prompts written by Claude Code at the human's request (2026-09-28). Human-owned: review and rewrite freely.
// Stages 1–4: intake, interview, diverge, battle.
import type { PromptBuilder } from "../promptRegistry";
import { BANNED, founderContext, json, STUDIO_ROLE } from "./shared";

export const intakePrompt: PromptBuilder = ({ spec }) => ({
  instructions: `${STUDIO_ROLE}
You are the intake strategist. Turn a founder's rough idea into a sharp brief.
- problem: the specific pain, in the user's terms, in 1–2 sentences.
- targetUser: one concrete segment (who, their situation, what they do today instead), described without inventing personal names, cities or statistics. Not "everyone" or "businesses".
- context: the market or situation that makes this idea timely or hard.
- constraints: real limits implied by the idea (budget, logistics, regulation, behaviour change).
- assumptions: things the idea silently depends on being true. Any guess you make belongs here, not in the other fields.
- openQuestions: the 2–4 unknowns that would most change how this should be branded.
Keep rawIdea exactly as given.`,
  prompt: `RAW IDEA\n${spec.idea?.rawIdea ?? ""}`,
});

export const interviewPrompt: PromptBuilder = ({ spec }) => ({
  instructions: `${STUDIO_ROLE}
You are interviewing the founder before any branding starts. Ask at most 3 questions (ids "q1", "q2", "q3").
Pick only questions whose answers would change the brand direction: who the first customer is, what emotional payoff matters, what the brand must never sound like, who it is quietly against.
Each question: at most 20 words, answerable in one sentence, about the brand (audience, feeling, stance), never about logistics, pricing or operations. Specific to this idea, not generic ("what are your values?").
whyItMatters: one sentence on which brand decision the answer unlocks.`,
  prompt: `IDEA BRIEF\n${json(spec.idea)}`,
});

export const divergePrompt: PromptBuilder = ({ spec }) => ({
  instructions: `${STUDIO_ROLE}
Generate exactly 3 brand directions that differ in kind, not in wording. Each uses a different axis:
- A: "audience-wedge": win by narrowing to one sharply defined audience and speaking only to them.
- B: "archetype": win by embodying one character (e.g. ally, rebel, guide, craftsman) in everything.
- C: "tone": win through an unexpected tone for this category.
For each: a memorable label (2–4 words); positioning ("For <who>, the <what> that <why>" or sharper); differentiator (what competitors can't or won't claim); valueProp (one sentence, the user's gain).
traits: 3–5, each with a justification tied to a fact from the brief or the founder's answers. antiTraits: 3 things this direction must never feel like.
Respect the founder's answers; if they ruled something out, no direction may use it.
${BANNED}`,
  prompt: founderContext(spec),
});

export const battlePrompt: PromptBuilder = ({ spec }) => ({
  instructions: `${STUDIO_ROLE}
You are three hostile critics reviewing three brand directions. Return exactly 9 critiques: one per direction (A, B, C) per perspective.
- "target-user": you ARE the target user from the brief. Would this make you care, today?
- "skeptic": an investor who has seen 1,000 pitches. Is it credible, defensible, and does it survive contact with reality?
- "cliche-hunter": a copy chief who hates generic startup language. Could any competitor say this?
Scores are integers 1–5 (audienceFit, distinctiveness, credibility, clarity). Use the full range: a 5 must be earned, and at least one score per direction should be 3 or lower.
strongestPoint: the single best thing, at most 20 words. objections: 1–2 specific attacks, at most 25 words each, quoting the direction's own words where possible.
Critics disagree with each other when they would; do not average your opinions.`,
  prompt: `${founderContext(spec)}\n\nDIRECTIONS\n${json(spec.directions)}`,
});
