import type { ApiErrorPayload, BrandSpec, GuardianCheckResult, Selection, Stage, StageResult } from "./types";
import { STAGES } from "./types";
import goldenFixture from "../../fixtures/run-sample.json";

const golden = goldenFixture as unknown as BrandSpec;
const mockEnabled = process.env.NEXT_PUBLIC_MOCK === "1";

function readMock(id: string): BrandSpec {
  if (typeof window !== "undefined") {
    const saved = window.sessionStorage.getItem(`grain:${id}`);
    if (saved) return JSON.parse(saved) as BrandSpec;
  }
  return { ...golden, id };
}

function saveMock(spec: BrandSpec): void {
  if (typeof window !== "undefined") window.sessionStorage.setItem(`grain:${spec.id}`, JSON.stringify(spec));
}

export class ApiError extends Error {
  constructor(public readonly code: string, message: string, public readonly stage?: Stage, public readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const candidate = payload as Partial<ApiErrorPayload> | null;
    throw new ApiError(
      candidate?.error?.code ?? "UNKNOWN",
      candidate?.error?.message ?? "The studio could not complete that request.",
      candidate?.error?.stage,
      response.status,
    );
  }
  return payload as T;
}

export async function createRun(rawIdea: string): Promise<{ id: string; spec: BrandSpec }> {
  if (mockEnabled) {
    const id = `mock-${Date.now().toString(36)}`;
    const spec: BrandSpec = {
      ...golden,
      id,
      idea: golden.idea ? { ...golden.idea, rawIdea } : undefined,
      stageStatus: Object.fromEntries(STAGES.map((stage) => [stage, "pending"])) as BrandSpec["stageStatus"],
    };
    saveMock(spec);
    return { id, spec };
  }
  return request("/api/runs", { method: "POST", body: JSON.stringify({ rawIdea }) });
}

export async function getRun(id: string): Promise<BrandSpec> {
  if (mockEnabled) return readMock(id);
  const result = await request<{ spec: BrandSpec }>(`/api/runs/${encodeURIComponent(id)}`);
  return result.spec;
}

export async function patchRun(id: string, input: { interviewAnswers?: Record<string, string>; selection?: Selection }): Promise<BrandSpec> {
  if (mockEnabled) {
    const previous = readMock(id);
    const spec: BrandSpec = {
      ...previous,
      interview: input.interviewAnswers && previous.interview ? { ...previous.interview, answers: input.interviewAnswers } : previous.interview,
      selection: input.selection ?? previous.selection,
    };
    saveMock(spec);
    return spec;
  }
  const result = await request<{ spec: BrandSpec }>(`/api/runs/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(input) });
  return result.spec;
}

export async function runStage(id: string, stage: Stage): Promise<StageResult> {
  if (mockEnabled) {
    await new Promise((resolve) => window.setTimeout(resolve, 650));
    const previous = readMock(id);
    const stageIndex = STAGES.indexOf(stage);
    const spec: BrandSpec = {
      ...golden,
      id,
      idea: previous.idea ?? golden.idea,
      selection: previous.selection ?? golden.selection,
      interview: previous.interview ?? golden.interview,
      stageStatus: Object.fromEntries(STAGES.map((item, index) => [item, index <= stageIndex ? "done" : previous.stageStatus[item]])) as BrandSpec["stageStatus"],
    };
    saveMock(spec);
    return { spec, stage, durationMs: 650 };
  }
  // Intentionally no AbortSignal or client timeout: local model stages can legitimately take ~60s.
  return request(`/api/runs/${encodeURIComponent(id)}/stages/${stage}`, { method: "POST", body: "{}", cache: "no-store" });
}

export async function checkGuardian(runId: string, text: string, kind: "tweet" | "headline" | "copy"): Promise<GuardianCheckResult> {
  if (mockEnabled) {
    const generic = /seamless|revolutionize|unlock|game-changer|ai-powered/i.test(text);
    return generic
      ? { passed: false, violations: [{ id: "mock-cliche", fields: [kind], severity: "med", rule: "Cliché language", explanation: "This phrase belongs to a crowded category vocabulary.", fix: "Replace the claim with a concrete action, time, or outcome." }], suggestedRewrite: "Say exactly what happens, for whom, and how quickly." }
      : { passed: true, violations: [], suggestedRewrite: text };
  }
  return request("/api/guardian/check", { method: "POST", body: JSON.stringify({ runId, text, kind }) });
}
