import { runDeterministicChecks } from "@/lib/guardian/deterministic";
import { crossFieldCheck, isBlocking } from "@/lib/guardian/llm";
import { generateStructured } from "@/lib/llm/generate";
import { Launch, type GuardianReport } from "@/lib/schema/brandSpec";
import { findCliches, LENGTH_LIMITS, wordCount } from "@/lib/scoring/text";
import { FIXTURE_NOTE, goldenSpec, livePrompt } from "../fixture";
import type { StageRunner } from "../types";

function checkDraft(l: Launch): string | null {
  const problems: string[] = [];
  if (wordCount(l.heroHeadline) > LENGTH_LIMITS.heroHeadline) problems.push(`heroHeadline must be at most ${LENGTH_LIMITS.heroHeadline} words.`);
  const cliches = [l.heroHeadline, l.heroSub, ...l.socialPosts.map((p) => p.text)].flatMap(findCliches);
  if (cliches.length) problems.push(`Remove these banned clichés: ${[...new Set(cliches)].join(", ")}.`);
  return problems.length ? problems.join(" ") : null;
}

export const runLaunch: StageRunner = async (spec) => {
  const prompt = livePrompt("launch", "launch");
  const launch: Launch = prompt
    ? await generateStructured({ stage: "launch", tier: "strong", schema: Launch, ...prompt({ spec }), refine: checkDraft, refineMode: "soft" })
    : goldenSpec().launch!;

  // Re-run the deterministic checks and a light Guardian pass on the launch copy only.
  const withLaunch = { ...spec, launch };
  const found = [
    ...runDeterministicChecks(withLaunch, "launch.").violations,
    ...((await crossFieldCheck(withLaunch, "launch-guardian", "launch")) ?? []),
  ].map((v) => ({ ...v, id: `launch-${v.id}` }));

  const prior: GuardianReport = spec.guardian ?? { passed: true, violations: [], revisions: [] };
  const guardian: GuardianReport = {
    passed: prior.passed && !found.some(isBlocking),
    violations: [...prior.violations.filter((v) => !v.id.startsWith("launch-")), ...found],
    revisions: prior.revisions,
  };

  const note = prompt ? "" : FIXTURE_NOTE;
  return {
    patch: { launch, guardian },
    trail: [
      { field: "launch.heroHeadline", basedOn: ["verbal.messageHierarchy.primary", "verbal.voice"], reason: `${note}Hero built on the primary message.` },
      { field: "launch.socialPosts", basedOn: ["verbal.voice.samples", "verbal.tagline"], reason: `${note}${launch.socialPosts.length} posts written in the brand voice.` },
      { field: "guardian", basedOn: ["launch"], reason: `Launch copy check: ${found.length} issue(s).` },
    ],
  };
};
