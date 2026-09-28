import type { BrandSpec, Direction } from "../lib/client/types";
import { DirectionCard } from "./DirectionCard";

export function BattleView({ spec, selectionError, selectingDirectionId, onChoose }: { spec: BrandSpec; selectionError: string | null; selectingDirectionId: Direction["id"] | null; onChoose: (direction: Direction, edits?: Partial<Direction>) => void }) {
  return <section className="stage-content battle"><header className="panel-heading"><span className="eyebrow">03 · adversarial review</span><h1>Three directions enter. One survives.</h1><p>Nine critiques pressure-test fit, clarity, credibility, and distinctiveness.</p></header>
    {selectionError && <p className="inline-error battle-error" role="alert">{selectionError}</p>}
    <div className="battle-grid">{spec.directions?.map((direction) => <DirectionCard key={direction.id} direction={direction} critiques={spec.critiques?.filter((item) => item.directionId === direction.id) ?? []} selected={spec.selection?.directionId === direction.id} savedEdits={spec.selection?.directionId === direction.id ? spec.selection.edits : undefined} selecting={selectingDirectionId === direction.id} onChoose={() => onChoose(direction)} onSave={(edits) => onChoose(direction, edits)} />)}</div>
  </section>;
}
