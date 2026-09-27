import { z } from "zod";
import { getRun } from "@/lib/db/runs";
import { checkSnippet } from "@/lib/guardian/deterministic";
import { checkSnippetWithLlm, isBlocking } from "@/lib/guardian/llm";
import { errorResponse, json, parseBody } from "../../_lib/http";

export const maxDuration = 60;

const Body = z.object({
  runId: z.string().min(1),
  text: z.string().trim().min(1).max(5000),
  kind: z.enum(["tweet", "headline", "copy"]),
});

export async function POST(req: Request) {
  try {
    const { runId, text, kind } = await parseBody(req, Body);
    const spec = await getRun(runId);

    const deterministic = checkSnippet(text, kind);
    const llm = await checkSnippetWithLlm({ spec, text, kind });
    const violations = [...deterministic, ...(llm?.violations.map((v, i) => ({ ...v, id: `llm-${i + 1}` })) ?? [])];

    return json({
      passed: !violations.some(isBlocking),
      violations,
      // Without the LLM check there is no rewrite; the original text is echoed back.
      suggestedRewrite: llm?.suggestedRewrite ?? text,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
