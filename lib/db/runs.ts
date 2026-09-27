import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { goldenSpec } from "@/lib/pipeline/fixture";
import { BrandSpec } from "@/lib/schema/brandSpec";

/**
 * Run storage, picked by env:
 * - SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY → Supabase `runs` table (Vercel).
 * - RUNS_DIR → one JSON file per run on disk (Docker, with a volume).
 * - neither → in-memory (local dev only; lost on restart).
 */
interface Store {
  get(id: string): Promise<unknown | null>;
  put(spec: BrandSpec): Promise<void>;
}

let client: SupabaseClient | null = null;

function supabaseStore(): Store | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  const db = client;
  return {
    async get(id) {
      const { data, error } = await db.from("runs").select("spec").eq("id", id).maybeSingle();
      if (error) throw new AppError("internal", `Failed to load run: ${error.message}`);
      return data ? (data as { spec: unknown }).spec : null;
    },
    async put(spec) {
      const { error } = await db.from("runs").upsert({ id: spec.id, spec, updated_at: new Date().toISOString() });
      if (error) throw new AppError("internal", `Failed to save run: ${error.message}`);
    },
  };
}

const SAFE_ID = /^[A-Za-z0-9_-]{1,64}$/;

function fileStore(): Store | null {
  const dir = process.env.RUNS_DIR;
  if (!dir) return null;
  const path = (id: string) => {
    if (!SAFE_ID.test(id)) throw new AppError("not_found", `Run ${id} not found`);
    return join(dir, `${id}.json`);
  };
  return {
    async get(id) {
      try {
        return JSON.parse(await readFile(path(id), "utf8")) as unknown;
      } catch (err) {
        if ((err as NodeJS.ErrnoException).code === "ENOENT") return null;
        throw err;
      }
    },
    async put(spec) {
      await mkdir(dir, { recursive: true });
      // Write-then-rename so a crash never leaves a half-written run.
      const tmp = `${path(spec.id)}.tmp`;
      await writeFile(tmp, JSON.stringify(spec));
      await rename(tmp, path(spec.id));
    },
  };
}

const memory = new Map<string, BrandSpec>();
const memoryStore: Store = {
  async get(id) {
    return memory.get(id) ?? null;
  },
  async put(spec) {
    memory.set(spec.id, structuredClone(spec));
  },
};

let store: Store | null = null;
function currentStore(): Store {
  if (store) return store;
  store = supabaseStore() ?? fileStore();
  if (!store) {
    log.warn("No SUPABASE_* or RUNS_DIR set; using in-memory run store");
    store = memoryStore;
  }
  return store;
}

export async function getRun(id: string): Promise<BrandSpec> {
  // The golden run (demo fallback, CLAUDE.md §10) is always readable, even with an empty database.
  if (id === "golden") return goldenSpec();
  const raw = await currentStore().get(id);
  if (raw === null) throw new AppError("not_found", `Run ${id} not found`);
  const parsed = BrandSpec.safeParse(raw);
  if (!parsed.success) throw new AppError("internal", `Stored run ${id} does not match the schema`);
  return structuredClone(parsed.data);
}

export async function saveRun(spec: BrandSpec): Promise<BrandSpec> {
  const valid = BrandSpec.parse(spec);
  if (valid.id === "golden") throw new AppError("bad_input", "The golden run is read-only");
  await currentStore().put(valid);
  return valid;
}
