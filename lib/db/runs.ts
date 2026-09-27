import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";
import { BrandSpec } from "@/lib/schema/brandSpec";

let client: SupabaseClient | null = null;

function supabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  client ??= createClient(url, key, { auth: { persistSession: false } });
  return client;
}

// Fallback for local dev without Supabase credentials. Not durable; not shared between serverless instances.
const memory = new Map<string, BrandSpec>();
let warned = false;
function warnMemory(): void {
  if (warned) return;
  warned = true;
  log.warn("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set; using in-memory run store");
}

export async function getRun(id: string): Promise<BrandSpec> {
  const db = supabase();
  if (!db) {
    warnMemory();
    const spec = memory.get(id);
    if (!spec) throw new AppError("not_found", `Run ${id} not found`);
    return structuredClone(spec);
  }

  const { data, error } = await db.from("runs").select("spec").eq("id", id).maybeSingle();
  if (error) throw new AppError("internal", `Failed to load run: ${error.message}`);
  if (!data) throw new AppError("not_found", `Run ${id} not found`);

  const parsed = BrandSpec.safeParse((data as { spec: unknown }).spec);
  if (!parsed.success) throw new AppError("internal", `Stored run ${id} does not match the schema`);
  return parsed.data;
}

export async function saveRun(spec: BrandSpec): Promise<BrandSpec> {
  const valid = BrandSpec.parse(spec);
  const db = supabase();
  if (!db) {
    warnMemory();
    memory.set(valid.id, structuredClone(valid));
    return valid;
  }

  const { error } = await db
    .from("runs")
    .upsert({ id: valid.id, spec: valid, updated_at: new Date().toISOString() });
  if (error) throw new AppError("internal", `Failed to save run: ${error.message}`);
  return valid;
}
