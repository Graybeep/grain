# CLAUDE.md — Brand Studio (Inkloom Hackathon)

> This file is the single source of truth for every coding agent in this repo.
> `AGENTS.md` is a symlink to this file so Codex reads the same rules:
> `ln -s CLAUDE.md AGENTS.md`
> If anything below conflicts with an instruction in a chat prompt, **stop and ask the human**.

---

## 0. Context in 30 seconds

- **What we're building:** an adversarial AI brand studio. A rough idea goes in. The system interviews the founder, generates 3 deliberately different brand directions, has critics attack them, measures how generic the language is against a real corpus, builds a verbal and visual identity, runs a consistency Guardian over everything, and outputs a shareable launch kit.
- **Our pitch to judges:** *"Every brand decision is argued for, attacked, measured and traceable."*
- **Time budget:** 24 hours total. **Feature freeze at hour 18.** Hours 18–24 are for the demo video, deploy fixes and submissions only.
- **Judging weights:** AI workflow 25%, originality 20%, working implementation 20%, usefulness 15%, UI/UX 10%, demo 10%.
- **The three features we never cut:** Battle (critics), the genericness score, and Guardian.

---

## 1. Golden rules (both agents, no exceptions)

1. **Stay in your lane.** Only edit files in directories you own (see §2). If a task needs a change outside your lane, write it into `TASKS.md` under "Requests" and stop.
2. **The schema is frozen.** `lib/schema/*` changes only with explicit human approval in the prompt ("schema change approved: …"). After approval, Claude Code applies the change and updates every consumer of it in the same commit.
3. **Prompts are human-owned.** Prompt text in `lib/pipeline/prompts/` is written by the human. Agents may wire prompts into code but must not reword them unless told to.
4. **Every LLM output is validated with Zod.** No unvalidated JSON reaches the database or the UI. On a parse failure: retry once, feeding the Zod error back to the model. On a second failure, return a typed error.
5. **No new dependencies without a one-line justification** in the commit message. Prefer what's already installed.
6. **TypeScript strict mode. No `any`.** Use `unknown` plus Zod parsing at boundaries.
7. **Commit at every working checkpoint.** Commit prefixes: `[cc]` for Claude Code, `[codex]` for Codex, `[human]` for the human. Small commits only; never commit a broken build to `main`.
8. **Never commit secrets.** Keys live in `.env.local` and in Vercel env vars. `.env.example` lists the variable names only.
9. **Don't "improve" things you weren't asked to touch.** No drive-by refactors, renames or reformatting of other files.
10. **When unsure, stub and flag.** Write a typed stub that returns fixture data, add a `// TODO(human):` comment, and log it in `TASKS.md`. Don't invent behavior.

---

## 2. Division of work

Both tools are agents that can read the repo and run commands. We split by **ownership of directories**, not by "big tasks vs small tasks." Clear lanes are what stop two agents from overwriting each other.

### Claude Code — Backend, pipeline, infrastructure (the Architect)

**Owns:**
- `lib/pipeline/**` — the stage runners and model calls (prompt text is human-owned, see rule 3)
- `lib/scoring/**` — genericness scoring and the deterministic checks
- `lib/guardian/**`
- `lib/db/**`
- `lib/llm/**`
- `app/api/**`
- `scripts/**`
- `data/**`
- `fixtures/**`
- Config files: `package.json`, `tsconfig.json`, `next.config.*`, `vercel.json`, `.env.example`
- `README.md`

**Responsibilities:**
- Scaffold the project and deploy the skeleton to Vercel by hour 3.
- Implement every API route defined in §5 exactly as specified.
- Stage runners, retries, Zod validation, the decision trail.
- Build the corpus, embed it, and implement genericness scoring (§7).
- Deterministic checks: contrast, cliché list, length limits.
- Guardian and its evaluation script (`scripts/eval-guardian.ts`).
- Terminal debugging: when the app crashes, read the stack trace, trace the fault across files, fix it.
- **Schema cascades:** when a schema change is approved, update every file that uses it in one commit. This includes frontend type usages, but only to keep the build compiling. It must not change UI behavior.
- Keep `fixtures/run-sample.json` in sync with the schema so the frontend can build against it.

### Codex — Frontend and UI (the Tactician)

**Owns:**
- `app/(site)/**` — all pages
- `components/**`
- `hooks/**`
- `lib/client/**` — the fetch wrappers for the API
- `styles/**`
- `public/**`

**Responsibilities:**
- Every page and component listed in §8.
- Stage-progress UI, the Battle view, the decision-trail panel, and the token-rendered previews.
- Client-side orchestration: call the stages in order (§5.2).
- Mock mode: when `NEXT_PUBLIC_MOCK=1`, read from `fixtures/run-sample.json` so UI work never waits on the backend.
- Loading, empty and error states for every stage.
- Docstrings and inline comments for any non-obvious UI logic.

**Codex must not:**
- Call LLM providers directly from the browser.
- Edit anything in `app/api/`, `lib/pipeline/` or `lib/schema/`.
- Invent response fields. If the UI needs data the API doesn't return, add it to `TASKS.md` under "Requests".

### Human (Ashwin) — Owns the judgment calls

- `lib/schema/**` and `lib/pipeline/prompts/**`
- Merge decisions, cut decisions, the demo script
- Reviewing every diff that touches the stage pipeline

### Shared, read-only for both agents

`lib/schema/**`, `CLAUDE.md`, `TASKS.md` (agents may only append to the "Requests" and "Done" sections).

---

## 3. Stack

| Layer | Choice | Why |
|---|---|---|
| App | Next.js (App Router) + TypeScript strict | One repo, one deploy, no CORS setup |
| Styling | Tailwind CSS | Fastest path to a clean UI |
| LLM | Vercel AI SDK + `@ai-sdk/anthropic` using `generateObject` with Zod | Structured output at every stage |
| Strong model | env `MODEL_STRONG` | Used for Diverge, Shape, Guardian, Launch |
| Fast model | env `MODEL_FAST` | Used for Intake, Interview, Battle, Visualize |
| Embeddings | OpenAI `text-embedding-3-small` with `dimensions: 512` (env `EMBED_MODEL`) | Cheap; the corpus is precomputed |
| Database | Supabase Postgres (a `runs` table with a JSONB column) | Stores runs for share links |
| Corpus | `data/corpus.json` loaded in memory | No vector DB needed at this size |
| Deploy | Vercel | Deploy URL exists from hour 3 |

**Env vars** (`.env.example`):
```
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
MODEL_STRONG=claude-sonnet-5
MODEL_FAST=claude-haiku-4-5-20251001
EMBED_MODEL=text-embedding-3-small
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_MOCK=0
```

---

## 4. Directory layout

```
/
├── CLAUDE.md                 # this file (AGENTS.md -> symlink)
├── TASKS.md                  # task board: Now / Next / Requests / Done
├── README.md                 # judge-facing: workflow diagram, stages, corpus disclosure
├── app/
│   ├── (site)/
│   │   ├── page.tsx              # landing + idea input            [codex]
│   │   ├── run/[id]/page.tsx     # studio: stage rail + panels     [codex]
│   │   └── share/[id]/page.tsx   # public brand kit + guardian tab [codex]
│   └── api/
│       ├── runs/route.ts                         # POST create       [cc]
│       ├── runs/[id]/route.ts                    # GET, PATCH        [cc]
│       ├── runs/[id]/stages/[stage]/route.ts     # POST run a stage  [cc]
│       └── guardian/check/route.ts               # POST paste-check  [cc]
├── components/                   # [codex]
├── hooks/                        # [codex]
├── lib/
│   ├── schema/                   # [human] Zod schemas — FROZEN
│   ├── pipeline/
│   │   ├── prompts/              # [human] prompt text
│   │   ├── stages/               # [cc] one file per stage
│   │   └── runStage.ts           # [cc] dispatcher, retry, trail
│   ├── scoring/                  # [cc] genericness, contrast, cliches, lengths
│   ├── guardian/                 # [cc]
│   ├── llm/                      # [cc] model clients, generateObject wrapper
│   ├── db/                       # [cc] supabase access
│   └── client/                   # [codex] typed fetch helpers
├── data/
│   ├── corpus-raw.csv            # [cc] source names/taglines (public data)
│   ├── corpus.json               # [cc] generated: text, type, embedding
│   ├── cliches.json              # [cc] banned-phrase list
│   └── font-pairings.json        # [cc] ~20 curated pairings with trait tags
├── fixtures/
│   ├── ideas.json                # 3 test ideas used everywhere
│   ├── run-sample.json           # complete BrandSpec for mock mode
│   └── guardian-cases.json       # 15 test cases with known violations
└── scripts/
    ├── build-corpus.ts
    └── eval-guardian.ts
```

---

## 5. Architecture

### 5.1 Pipeline

```
[intake] → [interview]* → [diverge] → [battle] → (user selects) → [shape]
        → [visualize] → [guardian] → [launch] → share URL
* interview = ONE adaptive round: ask up to 3 questions, the user answers, then continue
```

| # | Stage | Model | Reads from BrandSpec | Writes to BrandSpec | Checks |
|---|---|---|---|---|---|
| 1 | `intake` | fast | `idea.rawIdea` | `idea` (IdeaBrief) | Zod |
| 2 | `interview` | fast | `idea` | `interview.questions` → the user fills in `answers` | Zod, at most 3 questions |
| 3 | `diverge` | strong | `idea`, `interview` | `directions[3]` | Zod; each direction must use a different `axis` value |
| 4 | `battle` | fast | `idea`, `directions` | `critiques[]` from 3 perspectives × 3 directions, **in one call** | Zod |
| — | select | human | `directions`, `critiques` | `selection` | User picks one and can edit its fields |
| 5 | `shape` | strong | `idea`, the selected direction, `selection.edits` | `verbal` | Genericness score on every name and the tagline; cliché list; length limits |
| 6 | `visualize` | fast | selected direction's traits, `verbal.voice` | `visual` | Font chosen **only** from `font-pairings.json` by id; contrast computed in code |
| 7 | `guardian` | strong | everything above | `guardian` report + applied revisions | Deterministic checks first, then LLM cross-field check; at most 1 revise loop |
| 8 | `launch` | strong | `verbal`, `visual`, selected direction | `launch` | Re-runs the deterministic checks and a light Guardian pass on the launch copy |

**Every stage also appends to `trail`:** which field it produced, which fields it was based on, and a one-line reason. This is what powers the decision-trail panel.

### 5.2 Orchestration

- The **client** calls each stage in sequence: `POST /api/runs/:id/stages/:stage`. Never run the whole pipeline in one request. This avoids serverless timeouts and makes progress visible.
- Each stage route: load the run → check prerequisites (`409` if a required stage is missing) → run → validate → save → return `{ spec, stage, durationMs }`.
- Every route sets `export const maxDuration = 60`. Each stage must finish in under 45 seconds; if it doesn't, cut the prompt size, not the checks.
- Stages are **idempotent**: rerunning a stage overwrites its section and every section after it (mark the later ones `stale`).

### 5.3 API contract (Codex builds against exactly this)

| Method + path | Body | Returns |
|---|---|---|
| `POST /api/runs` | `{ rawIdea: string }` | `{ id, spec }` |
| `GET /api/runs/:id` | — | `{ spec }` |
| `PATCH /api/runs/:id` | `{ interviewAnswers? , selection? }` | `{ spec }` |
| `POST /api/runs/:id/stages/:stage` | `{}` | `{ spec, stage, durationMs }` |
| `POST /api/guardian/check` | `{ runId, text, kind: "tweet" \| "headline" \| "copy" }` | `{ passed, violations[], suggestedRewrite }` |

Errors always come back as `{ error: { code, message, stage? } }`. Status codes: `400` for bad input, `409` for a missing prerequisite, `422` when the LLM output failed validation twice, `500` for anything else.

---

## 6. BrandSpec schema (`lib/schema/brandSpec.ts`, human-owned)

This sketch is the contract. The Zod source in `lib/schema/` is authoritative once committed.

```ts
Stage = "intake"|"interview"|"diverge"|"battle"|"shape"|"visualize"|"guardian"|"launch"
StageStatus = "pending"|"running"|"done"|"error"|"stale"

IdeaBrief {
  rawIdea: string
  problem: string
  targetUser: string
  context: string
  constraints: string[]
  assumptions: string[]
  openQuestions: string[]
}

Interview {
  questions: { id: string; question: string; whyItMatters: string }[]   // max 3
  answers: Record<string, string>
}

Direction {
  id: "A"|"B"|"C"
  label: string
  axis: "audience-wedge"|"archetype"|"tone"      // must be unique across the 3 directions
  positioning: string
  differentiator: string
  valueProp: string
  traits: { name: string; justification: string }[]   // 3–5
  antiTraits: string[]
}

Critique {
  directionId: "A"|"B"|"C"
  perspective: "target-user"|"skeptic"|"cliche-hunter"
  scores: { audienceFit: 1-5; distinctiveness: 1-5; credibility: 1-5; clarity: 1-5 }
  strongestPoint: string
  objections: string[]
}

Selection { directionId: "A"|"B"|"C"; edits?: Partial<Direction> }

Verbal {
  names: { name: string; territory: "descriptive"|"invented"|"metaphor"|"compound"; rationale: string; genericness: number }[]
  chosenName: string
  tagline: { text: string; genericness: number }
  oneLiner: string
  messageHierarchy: { primary: string; supporting: string[] }
  voice: { principles: string[]; do: string[]; dont: string[]; samples: string[] }
}

Visual {
  fontPairingId: string
  palette: { name: string; hex: string; role: "primary"|"secondary"|"accent"|"bg"|"text" }[]
  contrastChecks: { fg: string; bg: string; ratio: number; pass: boolean }[]
  shapeLanguage: string
  imageryStyle: string
  logoBrief: string
  avoid: string[]
}

GuardianReport {
  passed: boolean
  violations: { id: string; fields: string[]; severity: "low"|"med"|"high"; rule: string; explanation: string; fix: string }[]
  revisions: { field: string; before: string; after: string; reason: string }[]
}

Launch {
  heroHeadline: string
  heroSub: string
  pitch: string
  socialPosts: { platform: "linkedin"|"x"|"instagram"; text: string }[]
}

TrailEntry { field: string; stage: Stage; basedOn: string[]; reason: string }

BrandSpec {
  id: string; createdAt: string
  stageStatus: Record<Stage, StageStatus>
  idea?: IdeaBrief; interview?: Interview; directions?: Direction[]; critiques?: Critique[]
  selection?: Selection; verbal?: Verbal; visual?: Visual; guardian?: GuardianReport; launch?: Launch
  trail: TrailEntry[]
}
```

---

## 7. Scoring and deterministic checks (Claude Code)

### Genericness score
- The corpus is 1,500 or more real startup names and taglines from a **public dataset**, stored in `data/corpus-raw.csv`.
- `scripts/build-corpus.ts` embeds every entry once and writes `data/corpus.json`. This runs offline, never at request time.
- At runtime: embed the candidate text, take the cosine similarity against every corpus entry of the same type, and return:
  `{ score: round(maxSim * 100), nearest: [{ text, sim }] × 3 }`
- Display bands: 70 or higher is **Generic**, 50–69 is **Familiar**, below 50 is **Distinct**. Tune these thresholds on the fixtures; don't guess.
- The README must disclose that the corpus was prepared from public data, and when.

### Deterministic checks (these run before any LLM check)
- **Contrast:** WCAG ratio of at least 4.5 for text on background. If a pair fails, adjust the text color's lightness in code until it passes, and record the change as a Guardian revision.
- **Clichés:** any phrase from `data/cliches.json` in a tagline, headline or voice sample is a violation. Seed list: revolutionize, seamless, empower, next-gen, unlock, game-changer, leverage, cutting-edge, disrupt, AI-powered, one-stop, all-in-one.
- **Length limits:** tagline ≤ 8 words; hero headline ≤ 12 words; one-liner ≤ 25 words.
- **Name checks:** the chosen name must not exactly match any corpus entry.

### Guardian
1. Run the deterministic checks.
2. Run the LLM cross-field check (strong model). Checks: traits ↔ voice, voice ↔ launch copy, traits ↔ fonts and palette, tagline ↔ positioning, anti-traits never showing up anywhere.
3. If any violation is high or medium severity: one revise pass, then check again.
4. **The bar:** `scripts/eval-guardian.ts` must catch at least 12 of the 15 cases in `fixtures/guardian-cases.json` before feature freeze.

---

## 8. Frontend spec (Codex)

### Pages
- **`/`** — hero, an idea textarea, the 3 example ideas from `fixtures/ideas.json` as one-click chips, and a Start button.
- **`/run/[id]`** — the studio:
  - Left: a **stage rail** showing all 8 stages with their status (pending, running, done, error, stale).
  - Center: the panel for the current stage.
  - Right: a **decision-trail drawer**. Clicking any output field highlights the trail entries it came from.
- **`/share/[id]`** — the public kit (read-only), with a tab for **Guardian check**: paste text, see violations and a suggested rewrite.

### Key components
- `IdeaInput`, `StageRail`, `InterviewForm`
- `DirectionCard` and `BattleView` — 3 cards side by side, the critique scores as small bars, objections expandable, a Choose button, and inline field editing
- `GenericnessBadge` — the score, its band, and the 3 nearest corpus matches on hover
- `VerbalPanel`, `VoicePanel`
- `TokenPreview` — renders a **landing hero** and a **social card** using the palette as CSS variables and the selected fonts loaded through a Google Fonts `<link>`
- `GuardianReport` — a violations list plus before → after diffs
- `LaunchPanel`, `DecisionTrail`, `ShareButton`

### UI rules
- Every stage panel has loading, error (with a retry button) and empty states.
- Never block the whole screen; the stage rail always shows progress.
- The Battle view is the visual centerpiece of the demo. Give it the most polish.
- Mobile layout: panels stack in a single column. The trail drawer becomes a bottom sheet.
- No fonts or colors hardcoded in `TokenPreview`; everything comes from the spec.

---

## 9. Timeline and owners

| Hours | Claude Code | Codex | Human | Exit criterion |
|---|---|---|---|---|
| 0–1 | Scaffold, `.env.example`, Supabase table | — | Commit schema + `SPEC` review | Schema committed |
| 1–3 | Stub all API routes returning fixtures; deploy to Vercel | Page shells + mock mode | Write intake and diverge prompts | Live URL works with fake data |
| 1–4 | Corpus build + genericness function | `IdeaInput`, `StageRail` | — | Score function callable |
| 3–10 | Real stages, one at a time, each tested on 3 ideas | `BattleView`, `DirectionCard`, `InterviewForm` | Write remaining prompts, review outputs | Full real run completes |
| 8–14 | Deterministic checks, `/api/guardian/check` | `TokenPreview`, `VerbalPanel`, `DecisionTrail` | Tune genericness thresholds | Clickable end to end |
| 12–16 | Guardian + `eval-guardian.ts` | `GuardianReport`, `/share/[id]` | Write 15 Guardian cases | ≥12/15 caught |
| 16–18 | Golden-run cache, bug fixes | Polish, responsive layout | Final cut decisions | **FEATURE FREEZE** |
| 18–21 | Fixes only for bugs found while recording | Fixes only | Record the demo | Video done |
| 21–24 | README with workflow diagram | — | Submission form + posts | Submitted by hour 23 |

**Cut order if behind:** first export polish, then the interview loop becomes a fixed 3-question form, then the mobile layout. **Never cut** Battle, the genericness score or Guardian.

---

## 10. Demo safety

- `fixtures/run-sample.json` must always be a complete, valid BrandSpec from a real run (the "golden run").
- A `?replay=golden` query parameter on `/run/[id]` replays the golden run with a simulated stage-by-stage delay. It's the fallback if the API fails during the live demo.
- Before recording, run the full pipeline on all 3 fixture ideas against the production deploy.

---

## 11. Definition of done (per task)

- [ ] It builds (`npm run build`) with no type errors.
- [ ] It works in mock mode **and** against the real API.
- [ ] It only touched files in the owner's lane.
- [ ] LLM outputs are validated; errors are typed and visible in the UI.
- [ ] It's committed with the correct prefix, and `TASKS.md` is updated.

---

## 12. Things neither agent does

- Change the schema or reword prompts without explicit approval.
- Add a vector database, authentication, payments, or Inkloom integration (it's not judged).
- Generate SVG logos with the LLM. We deliver a logo *brief* plus typographic previews.
- Scrape live websites at runtime.
- Leave `console.log` debugging in committed code (use `lib/log.ts`).
- Mark a task done without running it.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
