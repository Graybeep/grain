import { AppError } from "@/lib/errors";
import { runStage } from "@/lib/pipeline/runStage";
import { Stage } from "@/lib/schema/brandSpec";
import { errorResponse, json } from "../../../../_lib/http";

export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string; stage: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  try {
    const { id, stage } = await params;
    const parsed = Stage.safeParse(stage);
    if (!parsed.success) throw new AppError("bad_input", `Unknown stage "${stage}"`);
    return json(await runStage(id, parsed.data));
  } catch (err) {
    return errorResponse(err);
  }
}
