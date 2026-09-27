import { z } from "zod";
import { saveRun } from "@/lib/db/runs";
import { newRunSpec } from "@/lib/pipeline/newRun";
import { errorResponse, json, parseBody } from "../_lib/http";

export const maxDuration = 60;

const Body = z.object({ rawIdea: z.string().trim().min(10, "Describe the idea in at least 10 characters").max(2000) });

export async function POST(req: Request) {
  try {
    const { rawIdea } = await parseBody(req, Body);
    const spec = await saveRun(newRunSpec(rawIdea));
    return json({ id: spec.id, spec }, 201);
  } catch (err) {
    return errorResponse(err);
  }
}
