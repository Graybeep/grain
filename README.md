# Grain: adversarial AI brand studio

> Every brand decision is argued for, attacked, measured and traceable.

A rough idea goes in. Grain interviews the founder, generates three deliberately different brand directions, has critics attack them, measures how generic the language is against a real corpus, builds a verbal and visual identity, runs a consistency Guardian over everything, and outputs a shareable launch kit.

## Workflow

```
[intake] → [interview] → [diverge] → [battle] → (founder selects) → [shape]
        → [visualize] → [guardian] → [launch] → share URL
```

| # | Stage | Model | Produces | Checked by |
|---|---|---|---|---|
| 1 | intake | fast | Idea brief | Zod |
| 2 | interview | fast | ≤ 3 adaptive questions | Zod |
| 3 | diverge | strong | 3 directions on different axes (audience, archetype, tone) | Zod + unique-axis rule |
| 4 | battle | fast | 9 critiques: 3 critics × 3 directions, in one call | Zod + full coverage |
| 5 | shape | strong | Names, tagline, voice | Genericness score, cliché list, length limits |
| 6 | visualize | fast | Font pairing (from a curated list), palette, logo brief | Contrast computed in code |
| 7 | guardian | strong | Violations + revisions | Deterministic checks, then LLM cross-field check, one revise loop |
| 8 | launch | strong | Hero, pitch, social posts | Deterministic checks + light Guardian pass |

Each stage is its own request (`POST /api/runs/:id/stages/:stage`), so progress is visible and no request hits a serverless timeout. Every LLM output is validated with Zod; on failure, the model gets one retry with the validation error fed back. Every stage appends to a **decision trail**: which field it produced, what it was based on, and why.

## Genericness score

Candidate names and taglines are embedded (`text-embedding-3-small`, 512 dims) and compared by cosine similarity with a corpus of real startup names and one-liners of the same type. The score is `round(maxSim × 100)`: **≥ 70 Generic**, **50–69 Familiar**, **< 50 Distinct**. Each score shows its three nearest real-world matches.

**Corpus disclosure:** `data/corpus-raw.csv` holds 2,000 companies (4,000 rows: names and one-liners). They are the most recently launched companies in the public Y Combinator company directory, taken from the [yc-oss/api](https://github.com/yc-oss/api) mirror on 2026-09-27 with `scripts/fetch-corpus.ts`. Embeddings are computed offline once (`scripts/build-corpus.ts`); nothing is fetched or scraped at request time.

## Deterministic checks

- **Contrast:** WCAG ratio ≥ 4.5 for text on background. A failing text color is darkened or lightened in code until it passes, and the change is recorded as a Guardian revision.
- **Clichés:** `data/cliches.json` (revolutionize, seamless, empower, unlock, …).
- **Length:** tagline ≤ 8 words, hero headline ≤ 12, one-liner ≤ 25.
- **Name:** the chosen name must not exactly match a company in the corpus.

## Deploy with Docker (recommended)

One command runs the whole stack with a local LLM, no API keys and no external database:

```bash
# NVIDIA GPU host (Docker Desktop with GPU support, or the NVIDIA Container Toolkit)
docker compose -f docker-compose.yml -f docker-compose.gpu.yml up -d --build

# CPU-only host (works, but each stage is much slower)
docker compose up -d --build
```

Open http://localhost:3000 (change the port with `APP_PORT=8080`).

| Service | Role |
|---|---|
| `ollama` | Serves `qwen3.5:9b` (chat) and `nomic-embed-text:v1.5` (embeddings) on an internal network |
| `models` | One-shot: pulls the models into the `ollama` volume (about 7 GB, first start only) |
| `corpus` | One-shot: embeds the 4,000-row corpus with the stack's own embedding model (skipped once built) |
| `app` | The Next.js server. Runs are saved as JSON files in the `runs` volume, so they survive restarts. |
| `tunnel` | Opt-in public URL through a Cloudflare quick tunnel: `docker compose --profile public up -d`, then `docker compose logs tunnel` |

Swap models with `MODEL_STRONG`, `MODEL_FAST` and `EMBED_MODEL`. Changing `EMBED_MODEL` rebuilds the corpus on the next start.

## Running locally

```bash
npm install
cp .env.example .env.local      # fill in keys
npm run dev
```

### Local models (no API keys)

With [LM Studio](https://lmstudio.ai) (or any OpenAI-compatible server), set `LLM_PROVIDER=local` in `.env.local`:

```
LLM_PROVIDER=local
LOCAL_LLM_BASE_URL=http://localhost:1234/v1
MODEL_STRONG=qwen/qwen3.5-9b
MODEL_FAST=qwen/qwen3.5-9b
EMBED_MODEL=text-embedding-nomic-embed-text-v1.5
EMBED_PREFIX="clustering: "
```

Then run `lms server start`, load both models, and run `npm run build-corpus`. The corpus must be built with the same embedding model used at runtime; genericness reports "not measured" otherwise. Thinking is disabled for local reasoning models (`LOCAL_REASONING_EFFORT=none`) to stay inside the 45 s stage budget. A local server isn't reachable from a Vercel deploy, so this mode is for local development and recording.

Without an LLM provider configured, or before a stage's prompt is registered in `lib/pipeline/promptRegistry.ts`, stages return the golden-run fixture so the UI works end to end. Runs are stored in Supabase when `SUPABASE_*` is set, as JSON files under `RUNS_DIR` when that is set (Docker), and in memory otherwise.

| Script | Purpose |
|---|---|
| `npm run fetch-corpus` | Re-download the public corpus into `data/corpus-raw.csv` |
| `npm run build-corpus` | Embed the corpus into `data/corpus.json` (OpenAI, or the local embedding model) |
| `npm run eval-guardian` | Score Guardian against `fixtures/guardian-cases.json` (bar: 12/15) |
| `npm run validate-fixtures` | Check the fixtures against the schema and the contrast math |

Database: run `lib/db/schema.sql` once in Supabase.

## API

| Method + path | Body | Returns |
|---|---|---|
| `POST /api/runs` | `{ rawIdea }` | `{ id, spec }` |
| `GET /api/runs/:id` | — | `{ spec }` |
| `PATCH /api/runs/:id` | `{ interviewAnswers?, selection? }` | `{ spec }` |
| `POST /api/runs/:id/stages/:stage` | `{}` | `{ spec, stage, durationMs }` |
| `POST /api/guardian/check` | `{ runId, text, kind }` | `{ passed, violations, suggestedRewrite }` |

Errors: `{ error: { code, message, stage? } }`. Status codes: 400 bad input, 404 unknown run, 409 missing prerequisite, 422 LLM output invalid twice, 500 anything else.
