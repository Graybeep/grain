import { AppError } from "@/lib/errors";
import type { BrandSpec, Direction } from "@/lib/schema/brandSpec";

/** The user's chosen direction with their inline edits applied. */
export function selectedDirection(spec: BrandSpec): Direction {
  const sel = spec.selection;
  const base = spec.directions?.find((d) => d.id === sel?.directionId);
  if (!sel || !base) throw new AppError("missing_prerequisite", "No direction has been selected");
  return { ...base, ...sel.edits, id: base.id };
}
