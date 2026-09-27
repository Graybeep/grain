import type { Stage } from "@/lib/schema/brandSpec";

export type ErrorCode = "bad_input" | "not_found" | "missing_prerequisite" | "llm_invalid" | "internal";

const STATUS: Record<ErrorCode, number> = {
  bad_input: 400,
  not_found: 404,
  missing_prerequisite: 409,
  llm_invalid: 422,
  internal: 500,
};

/** Typed error that API routes turn into `{ error: { code, message, stage? } }`. */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly stage?: Stage;

  constructor(code: ErrorCode, message: string, stage?: Stage) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.stage = stage;
  }

  get status(): number {
    return STATUS[this.code];
  }
}
