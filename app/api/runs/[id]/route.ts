import { z } from "zod";
import { getRun, saveRun } from "@/lib/db/runs";
import { AppError } from "@/lib/errors";
import { markDownstreamStale } from "@/lib/pipeline/runStage";
import { Selection } from "@/lib/schema/brandSpec";
import { errorResponse, json, parseBody } from "../../_lib/http";

export const maxDuration = 60;

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    return json({ spec: await getRun(id) });
  } catch (err) {
    return errorResponse(err);
  }
}

const Patch = z
  .object({
    interviewAnswers: z.record(z.string(), z.string()).optional(),
    selection: Selection.optional(),
  })
  .refine((b) => b.interviewAnswers !== undefined || b.selection !== undefined, "Send interviewAnswers or selection");

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { id } = await params;
    const body = await parseBody(req, Patch);
    const spec = await getRun(id);

    if (body.interviewAnswers) {
      if (!spec.interview || spec.stageStatus.interview !== "done") {
        throw new AppError("missing_prerequisite", "Run the interview stage before answering", "interview");
      }
      const known = new Set(spec.interview.questions.map((q) => q.id));
      const unknown = Object.keys(body.interviewAnswers).filter((k) => !known.has(k));
      if (unknown.length) throw new AppError("bad_input", `Unknown question id(s): ${unknown.join(", ")}`);
      spec.interview.answers = { ...spec.interview.answers, ...body.interviewAnswers };
      markDownstreamStale(spec, "interview");
    }

    if (body.selection) {
      if (spec.stageStatus.battle !== "done") {
        throw new AppError("missing_prerequisite", "Run the battle stage before choosing a direction", "battle");
      }
      if (!spec.directions?.some((d) => d.id === body.selection?.directionId)) {
        throw new AppError("bad_input", `Direction ${body.selection.directionId} does not exist`);
      }
      spec.selection = body.selection;
      spec.trail = [
        ...spec.trail.filter((t) => t.field !== "selection"),
        {
          field: "selection",
          stage: "battle",
          basedOn: ["directions", "critiques"],
          reason: `Founder chose direction ${body.selection.directionId}${body.selection.edits ? " with edits" : ""}.`,
        },
      ];
      markDownstreamStale(spec, "battle");
    }

    return json({ spec: await saveRun(spec) });
  } catch (err) {
    return errorResponse(err);
  }
}
