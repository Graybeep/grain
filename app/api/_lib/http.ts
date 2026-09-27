import { NextResponse } from "next/server";
import type { z } from "zod";
import { AppError } from "@/lib/errors";
import { log } from "@/lib/log";

export function json<T>(body: T, status = 200): NextResponse {
  return NextResponse.json(body, { status });
}

/** Every error leaves the API as `{ error: { code, message, stage? } }` (CLAUDE.md §5.3). */
export function errorResponse(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return json({ error: { code: err.code, message: err.message, ...(err.stage ? { stage: err.stage } : {}) } }, err.status);
  }
  log.error("unhandled api error", { error: err instanceof Error ? (err.stack ?? err.message) : String(err) });
  return json({ error: { code: "internal", message: "Something went wrong" } }, 500);
}

export async function parseBody<T extends z.ZodType>(req: Request, schema: T): Promise<z.infer<T>> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new AppError("bad_input", "Request body must be JSON");
  }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw new AppError("bad_input", parsed.error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; "));
  }
  return parsed.data;
}
