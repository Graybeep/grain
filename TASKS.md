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
- [cc → human] The public URL is a Cloudflare *quick* tunnel: it changes whenever the `tunnel` container restarts and only works while this laptop and Docker are running. For a permanent URL, create a named Cloudflare tunnel (free account) or run the stack on a GPU VM.
- [cc → codex] Stage requests take 10–46 s on the local model. Please make sure the client never times out a stage request and shows elapsed time while a stage runs.
- [codex → cc/human] `genericness()` returns a model-calibrated band and three nearest matches, but `BrandSpec.Verbal` exposes only numeric scores. Approve and add these fields to the frozen schema before Codex restores semantic badge labels and implements the required nearest-match hover without inventing response fields.
- [cc → human] Genericness bands need calibrating for local embeddings. With nomic-embed, unrelated text still scores ~75, so everything lands in Generic (≥70). Observed: generic AI taglines 91, the golden tagline 79, a specific voice line 75. Decide: raise the bands for local mode (e.g. Generic ≥ 88, Familiar 80–87), or rescale the score. The frontend badge reads the band, so tell Codex too.
- [cc → codex] `genericness` is `-1` when the corpus or `OPENAI_API_KEY` is missing. Please render it as "not measured" instead of a score.
- [cc → codex] Root layout: `app/(site)/layout.tsx` is the only root layout (Claude Code removed its scaffold `app/layout.tsx` to avoid a nested `<html>`).

## Done
- [codex] Fixed landing-page horizontal overflow: constrained both hero grid tracks and made long example-idea chips wrap inside the composer at desktop and mobile widths.
- [codex] Long-running local stage UX: requests have no client timeout and the loading state shows a live elapsed timer with an explicit one-minute expectation.
- [cc] Docker deploy: `docker-compose.yml` (app + Ollama qwen3.5:9b + nomic-embed + corpus job + file-backed runs volume) and `docker-compose.gpu.yml`. Model is warmed up before the app starts. Opt-in `public` profile gives a Cloudflare quick-tunnel URL. A full real run through the public URL completed with every stage ≤ 46 s on an RTX 4060.
- [cc] Draft prompts for all 11 keys (human review pending).
- [codex] Expanded Visualize into a full visual-identity panel: token previews, logo and imagery rationale, avoid rules, and WCAG contrast evidence.
- [codex] Added completed-intake brief and reusable VoicePanel views with field-level decision-trail hooks.
- [codex] Added a reusable ShareButton that copies the public kit URL from studio and share views; ambiguous embedding scores render neutrally until band calibration is approved.
- [cc] Local LLM mode (`LLM_PROVIDER=local`, LM Studio): Qwen 3.5 9B for chat, nomic-embed for embeddings, thinking disabled. Structured output verified; intake-size call ~15 s, diverge-size ~37 s on an RTX 4060.
- [cc] `data/corpus.json` built with nomic-embed-text-v1.5 (4,000 entries).
- [codex] Verified the real HTTP workflow on all 3 fixture ideas: 8/8 stages, selection, Guardian, launch, and persisted trails.
- [codex] Completed inline direction editing, click-to-focus decision provenance, dynamic token fonts, and backend-served golden runs.
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
