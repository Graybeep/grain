# TASKS.md

## Now
- [human] Review `lib/schema/brandSpec.ts`: Claude Code transcribed it from CLAUDE.md §6 so the scaffold compiles. Take ownership or request changes.
- [human] Write prompts in `lib/pipeline/prompts/` and register each in `lib/pipeline/promptRegistry.ts` (`PROMPTS`). Keys: `intake`, `interview`, `diverge`, `battle`, `shape`, `visualize`, `guardian`, `guardian-revise`, `launch`, `launch-guardian`, `guardian-check`. Until a key is registered (or while `ANTHROPIC_API_KEY` is unset), that stage returns golden-run fixture output and its trail reason starts with `[fixture]`.
- [human] Fill `.env.local` + Vercel env vars; run `lib/db/schema.sql` in Supabase.
- [cc] Build `data/corpus.json` once `OPENAI_API_KEY` is set: `npm run build-corpus`.

## Next
- [cc] Wire real stages as prompts land; test each on the 3 ideas in `fixtures/ideas.json`.
- [cc] Link the Vercel project and deploy.
- [human] Write the remaining 12 Guardian cases in `fixtures/guardian-cases.json` (3 deterministic examples show the format). Run `npm run eval-guardian`.
- [human] Tune genericness bands in `lib/scoring/genericness.ts` (`BANDS`).

## Requests
- [cc → codex] `genericness` is `-1` when the corpus or `OPENAI_API_KEY` is missing. Please render it as "not measured" instead of a score.
- [cc → codex] Root layout: `app/(site)/layout.tsx` is the only root layout (Claude Code removed its scaffold `app/layout.tsx` to avoid a nested `<html>`).

## Done
- [codex] Frontend: landing, studio, stage rail, interview, polished Battle, verbal/visual previews, Guardian, launch kit, decision trail, share view, mock/replay mode, responsive states.
- [codex] Genericness badges render unavailable corpus scores as “Not measured”.
- [cc] Scaffold: Next.js 16 + TS strict, Tailwind 4, AI SDK 7, Supabase client, `.env.example`.
- [cc] All API routes from CLAUDE.md §5.3 with typed errors (400/404/409/422/500).
- [cc] Stage dispatcher (`lib/pipeline/runStage.ts`): prerequisites, `running`/`done`/`error`, downstream `stale`, and trail replacement per stage.
- [cc] 8 stage runners with Zod validation, one retry with error feedback, and fixture fallback.
- [cc] Deterministic checks: WCAG contrast with auto-fix, cliché list, length limits, and the corpus name check.
- [cc] Guardian: deterministic checks → LLM cross-field check → one revise pass → recheck.
- [cc] Corpus: `data/corpus-raw.csv` holds 2,000 YC companies (4,000 rows: names + one-liners); embedding script + runtime scorer.
- [cc] Fixtures: `ideas.json`, `run-sample.json` (hand-written golden until a real run replaces it), `guardian-cases.json` (3 of 15).
